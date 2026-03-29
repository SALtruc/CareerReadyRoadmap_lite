import { renderStageInfoModal } from "../components/StageInfoModal.js";
import { renderTopBar } from "../components/TopBar.js";
import { getStageScore } from "../utils/selectors.js";

const resultsCoachAssetPath = "./src/assets/welcome-coach.png";
const resultsBubbleAssetPath = "./src/assets/lite/result/Bubble Chat2.png";
const resultsExploreAssetPath = "./src/assets/lite/result/Frame 157.png";
const resultsDevelopAssetPath = "./src/assets/lite/result/Frame 158.png";
const resultsTransitionAssetPath = "./src/assets/lite/result/Frame 159.png";

const resultCards = [
  {
    stage: "explore",
    label: "Explore",
    assetPath: resultsExploreAssetPath
  },
  {
    stage: "develop",
    label: "Develop",
    assetPath: resultsDevelopAssetPath
  },
  {
    stage: "transition",
    label: "Transition",
    assetPath: resultsTransitionAssetPath
  }
];

export function renderSummaryScreen(state) {
  const scores = {
    explore: getStageScore(state, "explore"),
    develop: getStageScore(state, "develop"),
    transition: getStageScore(state, "transition")
  };

  return `
    <section class="screen screen--summary grid-bg bg-transition">
      ${renderTopBar(state, { showAvatar: true })}
      <div class="summary-viewport">
        <div class="summary-shell" data-preserve-scroll="summary-results">
          <div class="summary-results__hero">
            <img
              class="summary-results__coach"
              data-asset-image="summary-results-coach"
              src="${resultsCoachAssetPath}"
              alt=""
              decoding="async"
              loading="eager"
              draggable="false"
            >
            <div class="summary-results__callout">
              <img
                class="summary-results__bubble"
                data-asset-image="summary-results-bubble"
                src="${resultsBubbleAssetPath}"
                alt="This is your current readiness. Next, explore activities to improve your score."
                decoding="async"
                loading="eager"
                draggable="false"
              >
              <button
                class="summary-results__info"
                type="button"
                data-action="toggle-stage-info"
                aria-label="Open stage overview"
              >
                i
              </button>
            </div>
          </div>
          <div class="summary-results__cards" aria-label="Career readiness scores">
            ${resultCards
              .map((card) =>
                renderResultCard({
                  ...card,
                  score: scores[card.stage]
                })
              )
              .join("")}
          </div>
          <div class="summary-results__actions">
            <button
              class="summary-results__next"
              type="button"
              data-action="start-premade-roadmap-flow"
              aria-label="Continue to student ID unlock"
            >
              <span>Next</span>
            </button>
          </div>
        </div>
      </div>
      ${state.showStageInfo ? renderStageInfoModal() : ""}
    </section>
  `;
}

function renderResultCard({ stage, label, score, assetPath }) {
  return `
    <article class="summary-result-card summary-result-card--${stage}" aria-label="${label} ${score} percent">
      <img
        class="summary-result-card__image"
        data-asset-image="${stage}-result-card"
        src="${assetPath}"
        alt=""
        decoding="async"
        loading="eager"
        draggable="false"
      >
      <b class="summary-result-card__score" aria-hidden="true">${score}%</b>
    </article>
  `;
}
