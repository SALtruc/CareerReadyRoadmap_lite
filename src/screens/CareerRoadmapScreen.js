import { renderTopBar } from "../components/TopBar.js";
import {
  ROADMAP_BACKGROUND_ASSET_PATH,
  ROADMAP_PREMADE_ASSET_PATH,
  ROADMAP_FACEBOOK_LINKS,
  getRoadmapPosterSize,
  getRoadmapScores,
  getRoadmapSelections,
  roadmapStageScoreLayout
} from "../data/roadmap.js";

export function renderCareerRoadmapScreen(state) {
  const isPremadeRoadmap = state.roadmapVariant === "premade";
  const posterAssetPath = isPremadeRoadmap
    ? ROADMAP_PREMADE_ASSET_PATH
    : ROADMAP_BACKGROUND_ASSET_PATH;
  const posterSize = getRoadmapPosterSize(state.roadmapVariant);
  const scores = getRoadmapScores(state);
  const selections = isPremadeRoadmap ? [] : getRoadmapSelections(state);

  return `
    <section class="screen screen--career-roadmap grid-bg bg-transition" data-preserve-scroll="career-roadmap">
      ${renderTopBar(state, { showAvatar: true })}
      <div class="career-roadmap-toolbar" role="group" aria-label="Roadmap actions">
        <button
          class="career-roadmap-toolbar__button career-roadmap-toolbar__button--back"
          type="button"
          data-action="roadmap-back"
        >
          <span aria-hidden="true">&larr;</span>
          <span>Back</span>
        </button>
        <button
          class="career-roadmap-toolbar__button career-roadmap-toolbar__button--restart"
          type="button"
          data-action="restart-flow"
        >
          <span>Reset</span>
        </button>
      </div>
      <div class="career-roadmap-shell">
        <div class="career-roadmap-poster" data-roadmap-poster="true">
          <img
            class="career-roadmap-poster__base"
            data-asset-image="career-roadmap-poster"
            src="${posterAssetPath}"
            alt="${isPremadeRoadmap ? "Pre-made career roadmap poster" : "Career roadmap poster"}"
            decoding="async"
            loading="eager"
            draggable="false"
          >
          ${isPremadeRoadmap ? "" : `
            ${renderRoadmapScore("explore", scores.explore, posterSize)}
            ${renderRoadmapScore("develop", scores.develop, posterSize)}
            ${renderRoadmapScore("transition", scores.transition, posterSize)}
            ${selections.map((selection) => renderRoadmapSelection(selection, posterSize)).join("")}
          `}
          <button
            class="career-roadmap-download-hotspot"
            type="button"
            data-action="download-career-roadmap"
            aria-label="Download your roadmap as a PNG image"
          >
            <span class="sr-only">Download your roadmap</span>
          </button>
          <a
            class="career-roadmap-social-link career-roadmap-social-link--sgs"
            href="${ROADMAP_FACEBOOK_LINKS.sgs}"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Open Career Ready SGS Facebook page"
          >
            <span class="sr-only">Career Ready SGS Facebook</span>
          </a>
          <a
            class="career-roadmap-social-link career-roadmap-social-link--hanoi"
            href="${ROADMAP_FACEBOOK_LINKS.hanoi}"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Open Career Ready Hanoi Facebook page"
          >
            <span class="sr-only">Career Ready Hanoi Facebook</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

function renderRoadmapScore(stage, score, posterSize) {
  const layout = roadmapStageScoreLayout[stage];

  return `
    <div
      class="career-roadmap-score career-roadmap-score--${stage}"
      style="${formatRoadmapStyle({
        left: `${toPercent(layout.x, posterSize.width)}%`,
        top: `${toPercent(layout.y, posterSize.height)}%`,
        "--roadmap-score-font": `${toPercent(layout.fontSize, posterSize.width)}cqw`
      })}"
      aria-label="${stage} score ${score} percent"
    >
      <span class="career-roadmap-score__value">${score}%</span>
    </div>
  `;
}

function renderRoadmapSelection(selection, posterSize) {
  const { slot } = selection;
  const scale = slot.scale || 1;

  return `
    <div
      class="career-roadmap-selection career-roadmap-selection--${selection.stage}"
      style="${formatRoadmapStyle({
        left: `${toPercent(slot.x, posterSize.width)}%`,
        top: `${toPercent(slot.y, posterSize.height)}%`,
        width: `${toPercent(slot.maxWidth * scale, posterSize.width)}%`,
        height: `${toPercent(slot.maxHeight * scale, posterSize.height)}%`,
        "--roadmap-item-rotate": `${slot.rotate}deg`
      })}"
      aria-hidden="true"
    >
      <img
        class="career-roadmap-selection__image"
        data-asset-image="career-roadmap-${selection.activityId}"
        src="${selection.assetPath}"
        alt="${selection.title}"
        decoding="async"
        loading="lazy"
        draggable="false"
      >
    </div>
  `;
}

function formatRoadmapStyle(styleMap) {
  return Object.entries(styleMap)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}

function toPercent(value, total) {
  return ((value / total) * 100).toFixed(4);
}
