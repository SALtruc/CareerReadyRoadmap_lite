import { getAssetStateClass } from "../utils/assets.js";

const mapImagePath = "./src/assets/Map.png";

export function renderStageInfoModal() {
  return `
    <div
      class="modal-scrim stage-info-overlay"
      data-component="stage-info-modal"
      data-action="close-stage-info"
    >
      <div
        class="stage-info-sheet stage-info-sheet--image"
        role="dialog"
        aria-modal="true"
        aria-label="About the three career stages"
      >
        <button
          class="stage-info-sheet__close icon-button"
          type="button"
          data-action="close-stage-info"
          aria-label="Close stage overview"
        >
          &times;
        </button>
        <div class="stage-info-image ${getAssetStateClass(mapImagePath)}" data-asset-container="stage-map">
          <img
            class="stage-info-image__img"
            data-asset-image="stage-map"
            src="${mapImagePath}"
            alt="Three career stages map"
            decoding="async"
            loading="eager"
          >
        </div>
      </div>
    </div>
  `;
}
