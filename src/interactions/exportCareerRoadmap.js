import {
  ROADMAP_BACKGROUND_ASSET_PATH,
  ROADMAP_PREMADE_ASSET_PATH,
  getRoadmapPosterSize,
  getRoadmapScores,
  getRoadmapSelections,
  roadmapStageScoreLayout
} from "../data/roadmap.js";

const ROADMAP_EXPORT_WIDTH = 1080;

export async function exportCareerRoadmap(state) {
  const isPremadeRoadmap = state.roadmapVariant === "premade";
  const backgroundAssetPath = isPremadeRoadmap
    ? ROADMAP_PREMADE_ASSET_PATH
    : ROADMAP_BACKGROUND_ASSET_PATH;
  const posterSize = getRoadmapPosterSize(state.roadmapVariant);
  const canvas = document.createElement("canvas");
  const scale = ROADMAP_EXPORT_WIDTH / posterSize.width;
  const exportHeight = Math.round(posterSize.height * scale);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context unavailable");
  }

  canvas.width = ROADMAP_EXPORT_WIDTH;
  canvas.height = exportHeight;

  const [backgroundImage, selectionImages] = await Promise.all([
    loadImage(backgroundAssetPath),
    isPremadeRoadmap
      ? Promise.resolve([])
      : Promise.all(
          getRoadmapSelections(state).map(async (selection) => ({
            selection,
            image: await loadImage(selection.assetPath)
          }))
        )
  ]);

  if (document.fonts?.ready) {
    await document.fonts.ready.catch(() => {});
  }

  context.save();
  context.scale(scale, scale);
  context.drawImage(
    backgroundImage,
    0,
    0,
    posterSize.width,
    posterSize.height
  );

  if (!isPremadeRoadmap) {
    drawRoadmapScores(context, getRoadmapScores(state));
    drawRoadmapSelections(context, selectionImages);
  }

  context.restore();

  const blob = await canvasToBlob(canvas);
  const filename = `${isPremadeRoadmap ? "career-roadmap-premade" : "career-roadmap"}-${new Date().toISOString().slice(0, 10)}.png`;
  await saveRoadmapBlob(blob, filename);
}

function drawRoadmapScores(context, scores) {
  Object.entries(scores).forEach(([stage, score]) => {
    const layout = roadmapStageScoreLayout[stage];

    context.save();
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `500 ${layout.fontSize}px "Museo", "Helvetica Neue", Arial, sans-serif`;
    context.fillText(`${score}%`, layout.x, layout.y);
    context.restore();
  });
}

function drawRoadmapSelections(context, selectionImages) {
  selectionImages.forEach(({ selection, image }) => {
    const { slot } = selection;
    const fitted = fitContain(
      image.naturalWidth || image.width,
      image.naturalHeight || image.height,
      slot.maxWidth,
      slot.maxHeight
    );
    const scale = slot.scale || 1;
    const drawWidth = fitted.width * scale;
    const drawHeight = fitted.height * scale;

    context.save();
    context.translate(slot.x, slot.y);
    context.rotate((slot.rotate * Math.PI) / 180);
    context.shadowColor = "rgba(0, 0, 0, 0.28)";
    context.shadowBlur = 0;
    context.shadowOffsetX = 22;
    context.shadowOffsetY = 26;
    context.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    context.restore();
  });
}

function fitContain(sourceWidth, sourceHeight, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);

  return {
    width: Math.round(sourceWidth * ratio),
    height: Math.round(sourceHeight * ratio)
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Failed to export roadmap image"));
    }, "image/png");
  });
}

async function saveRoadmapBlob(blob, filename) {
  const file =
    typeof File === "function"
      ? new File([blob], filename, { type: blob.type || "image/png" })
      : null;

  if (
    file &&
    navigator.share &&
    (!navigator.canShare || navigator.canShare({ files: [file] }))
  ) {
    try {
      await navigator.share({
        files: [file],
        title: "Career Roadmap"
      });
      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1500);
}
