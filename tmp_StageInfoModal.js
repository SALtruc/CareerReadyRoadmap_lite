import { stageMeta } from "../data/stages.js";
import { renderStageShape } from "./StageShape.js";

export function renderStageInfoModal() {
  return `
    <div
      class="modal-scrim stage-info-overlay"
      data-component="stage-info-modal"
      data-action="close-stage-info"
    >
      <div class="stage-info-sheet" role="dialog" aria-modal="true" aria-label="About the three career stages">
        <button
          class="stage-info-sheet__close icon-button"
          type="button"
          data-action="close-stage-info"
          aria-label="Close stage overview"
        >
          &times;
        </button>
        <div class="stage-info-sheet__canvas">
          <svg class="stage-info-sheet__lines" viewBox="0 0 354 760" aria-hidden="true" focusable="false">
            <defs>
              <marker id="stage-info-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M0 0L10 5L0 10Z" fill="rgba(255,255,255,0.96)" />
              </marker>
            </defs>
            <path d="M54 152V286H224" marker-end="url(#stage-info-arrow)" />
            <path d="M314 392V560H120" marker-end="url(#stage-info-arrow)" />
          </svg>

          <div class="stage-info-node stage-info-node--explore">
            ${renderStageShape({
              stageKey: "explore",
              meta: stageMeta.explore,
              extraClass: "summary-shape--info",
              showScore: false
            })}
          </div>
          <article class="stage-info-copy stage-info-copy--explore">
            <p>${stageMeta.explore.overview}</p>
          </article>

          <div class="stage-info-node stage-info-node--develop">
            ${renderStageShape({
              stageKey: "develop",
              meta: stageMeta.develop,
              extraClass: "summary-shape--info",
              showScore: false
            })}
          </div>
          <article class="stage-info-copy stage-info-copy--develop">
            <p>${stageMeta.develop.overview}</p>
          </article>

          <div class="stage-info-node stage-info-node--transition">
            ${renderStageShape({
              stageKey: "transition",
              meta: stageMeta.transition,
              extraClass: "summary-shape--info",
              showScore: false
            })}
          </div>
          <article class="stage-info-copy stage-info-copy--transition">
            <p>${stageMeta.transition.overview}</p>
          </article>
        </div>
      </div>
    </div>
  `;
}
