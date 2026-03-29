const loadedAssetPaths = new Set();
const failedAssetPaths = new Set();
const warmedAssetPaths = new Set();
const queuedAssetPaths = new Set();
const pendingAssetPaths = [];
const assetStateListeners = new Set();

const MAX_CONCURRENT_WARMS = 4;

let activeWarmCount = 0;
let warmDrainHandle = null;

function scheduleWarmDrain() {
  if (warmDrainHandle !== null || pendingAssetPaths.length === 0) {
    return;
  }

  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    warmDrainHandle = window.requestIdleCallback(
      () => {
        warmDrainHandle = null;
        drainWarmQueue();
      },
      { timeout: 120 }
    );

    return;
  }

  warmDrainHandle = window.setTimeout(() => {
    warmDrainHandle = null;
    drainWarmQueue();
  }, 40);
}

function finalizeWarm(assetPath, didLoad) {
  queuedAssetPaths.delete(assetPath);
  activeWarmCount = Math.max(0, activeWarmCount - 1);

  if (didLoad) {
    markAssetLoaded(assetPath);
  } else {
    markAssetFailed(assetPath);
  }

  scheduleWarmDrain();
}

function startWarmAsset(assetPath) {
  activeWarmCount += 1;

  const image = new Image();
  let hasFinalized = false;

  const completeWarm = (didLoad) => {
    if (hasFinalized) {
      return;
    }

    hasFinalized = true;
    finalizeWarm(assetPath, didLoad);
  };

  image.addEventListener("load", () => {
    completeWarm(true);
  });

  image.addEventListener("error", () => {
    completeWarm(false);
  });

  image.src = assetPath;

  if (image.complete) {
    completeWarm(image.naturalWidth > 0);
  }
}

function drainWarmQueue() {
  while (activeWarmCount < MAX_CONCURRENT_WARMS && pendingAssetPaths.length > 0) {
    const assetPath = pendingAssetPaths.shift();

    if (!assetPath) {
      continue;
    }

    startWarmAsset(assetPath);
  }
}

function emitAssetStateChange(assetPath, status) {
  assetStateListeners.forEach((listener) => {
    try {
      listener({ assetPath, status });
    } catch (error) {
      console.error("Asset state listener failed", error);
    }
  });
}

export function getAssetStateClass(assetPath) {
  return loadedAssetPaths.has(assetPath) ? "has-asset" : "asset-missing";
}

export function markAssetLoaded(assetPath) {
  if (!assetPath) {
    return;
  }

  const didChange = !loadedAssetPaths.has(assetPath) || failedAssetPaths.has(assetPath);
  loadedAssetPaths.add(assetPath);
  failedAssetPaths.delete(assetPath);

  if (didChange) {
    emitAssetStateChange(assetPath, "loaded");
  }
}

export function markAssetFailed(assetPath) {
  if (!assetPath) {
    return;
  }

  const didChange = !failedAssetPaths.has(assetPath) || loadedAssetPaths.has(assetPath);
  failedAssetPaths.add(assetPath);
  loadedAssetPaths.delete(assetPath);

  if (didChange) {
    emitAssetStateChange(assetPath, "failed");
  }
}

export function subscribeToAssetStateChanges(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }

  assetStateListeners.add(listener);

  return () => {
    assetStateListeners.delete(listener);
  };
}

export function warmAssetSources(assetPaths) {
  assetPaths.forEach((assetPath) => {
    if (
      !assetPath ||
      warmedAssetPaths.has(assetPath) ||
      queuedAssetPaths.has(assetPath) ||
      failedAssetPaths.has(assetPath)
    ) {
      return;
    }

    warmedAssetPaths.add(assetPath);
    queuedAssetPaths.add(assetPath);
    pendingAssetPaths.push(assetPath);
  });

  scheduleWarmDrain();
}
