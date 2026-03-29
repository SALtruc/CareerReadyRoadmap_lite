import { getAssetStateClass } from "../utils/assets.js";

export function renderCoach() {
  const coachImagePath = "./src/assets/welcome-coach.png";

  return `
    <div class="coach ${getAssetStateClass(coachImagePath)}" data-component="coach" data-asset-container="coach" aria-hidden="true">
      <img
        class="coach__image"
        data-asset-image="coach"
        src="${coachImagePath}"
        alt="Welcome coach illustration"
        decoding="async"
        loading="eager"
        fetchpriority="high"
      >
      <div class="coach__fallback">
        <div class="coach__hair"></div>
        <div class="coach__head"></div>
        <div class="coach__body"></div>
        <div class="coach__skirt"></div>
        <div class="coach__arm"></div>
        <div class="coach__arm right"></div>
        <div class="coach__clipboard"></div>
        <div class="coach__tag"></div>
        <div class="coach__hand"></div>
      </div>
    </div>
  `;
}
