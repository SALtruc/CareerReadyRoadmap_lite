const DEFAULT_FRAME_DELAY_MS = 10;
const gifDurationPromiseBySrc = new Map();

export function getGifDurationMs(src) {
  if (!src) {
    return Promise.reject(new Error("GIF source is required"));
  }

  if (gifDurationPromiseBySrc.has(src)) {
    return gifDurationPromiseBySrc.get(src);
  }

  const durationPromise = fetch(src)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch GIF: ${src}`);
      }

      return response.arrayBuffer();
    })
    .then(parseGifDurationMs)
    .catch((error) => {
      gifDurationPromiseBySrc.delete(src);
      throw error;
    });

  gifDurationPromiseBySrc.set(src, durationPromise);
  return durationPromise;
}

function parseGifDurationMs(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);

  if (bytes.length < 14 || bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46) {
    throw new Error("Invalid GIF data");
  }

  let offset = 13;
  const globalColorTableFlag = (bytes[10] & 0x80) !== 0;

  if (globalColorTableFlag) {
    offset += getColorTableByteLength(bytes[10]);
  }

  let durationMs = 0;

  while (offset < bytes.length) {
    const blockId = bytes[offset++];

    if (blockId === 0x3b) {
      break;
    }

    if (blockId === 0x21) {
      const extensionLabel = bytes[offset++];

      if (extensionLabel === 0xf9) {
        const blockSize = bytes[offset++];

        if (blockSize !== 4) {
          offset += blockSize;
          offset = skipSubBlocks(bytes, offset);
          continue;
        }

        offset += 1;
        const delayCentiseconds = bytes[offset] | (bytes[offset + 1] << 8);
        durationMs += Math.max(delayCentiseconds * 10, DEFAULT_FRAME_DELAY_MS);
        offset += 2;
        offset += 1;
        offset += 1;
        continue;
      }

      const extensionBlockSize = bytes[offset++];
      offset += extensionBlockSize;
      offset = skipSubBlocks(bytes, offset);
      continue;
    }

    if (blockId === 0x2c) {
      offset += 8;
      const packedFields = bytes[offset++];
      const localColorTableFlag = (packedFields & 0x80) !== 0;

      if (localColorTableFlag) {
        offset += getColorTableByteLength(packedFields);
      }

      offset += 1;
      offset = skipSubBlocks(bytes, offset);
      continue;
    }

    throw new Error("Unsupported GIF block");
  }

  if (durationMs <= 0) {
    throw new Error("GIF duration unavailable");
  }

  return durationMs;
}

function getColorTableByteLength(packedFields) {
  return 3 * (2 ** ((packedFields & 0x07) + 1));
}

function skipSubBlocks(bytes, offset) {
  while (offset < bytes.length) {
    const blockSize = bytes[offset++];

    if (blockSize === 0) {
      break;
    }

    offset += blockSize;
  }

  return offset;
}
