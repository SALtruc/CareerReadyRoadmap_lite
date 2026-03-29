import { renderActivityCard } from "../components/ActivityCard.js";
import { renderSectionRibbon } from "../components/SectionRibbon.js";
import { renderSegmentBar } from "../components/SegmentBar.js";
import { renderTopBar } from "../components/TopBar.js";
import {
  activities,
  exploreScoreAssetPath,
  stageActivityScreens
} from "../data/activities.js";
import { stageMeta } from "../data/stages.js";
import { getStageScore } from "../utils/selectors.js";

function renderStageScore(score, scoreShape) {
  if (scoreShape === "triangle") {
    return `
      <div class="stage-activities__score stage-activities__score--triangle">
        <img
          class="stage-activities__score-figure"
          src="${exploreScoreAssetPath}"
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="eager"
        >
        <span class="stage-activities__score-value">${score}%</span>
      </div>
    `;
  }

  return `
    <div class="stage-activities__score stage-activities__score--${scoreShape}">
      <span class="stage-activities__score-value">${score}%</span>
    </div>
  `;
}

export function renderExploreScreen(state) {
  const stageKey = stageMeta[state.activeStage] ? state.activeStage : "explore";
  const stage = stageMeta[stageKey];
  const screenConfig = stageActivityScreens[stageKey];
  const stageActivities = activities[stageKey] || [];
  const activityMap = Object.fromEntries(
    stageActivities.map((activity) => [activity.id, activity])
  );
  const selections = state.activitySelections[stageKey] || [];
  const score = getStageScore(state, stageKey);
  const logoVariant = stageKey === "develop" ? "yellow" : "default";

  return `
    <section
      class="screen screen--stage-activities grid-bg ${stage.background} stage-activities--${stageKey}"
      style="--stage-content-width:${screenConfig.contentWidth}px;"
    >
      <div class="stage-activities__scroll" data-preserve-scroll="stage-activities-${stageKey}">
        <div class="stage-activities__content">
          ${renderTopBar(state, { showAvatar: true, logoVariant })}
          <button class="back-link stage-activities__back" type="button" data-action="stage-back">
            ${screenConfig.backLabel}
          </button>
          <header class="stage-activities__hero stage-activities__hero--${screenConfig.titleTone}">
            <div class="stage-activities__hero-copy">
              <h1 class="stage-activities__title">${screenConfig.label}</h1>
              <p class="stage-activities__subtitle">
                You can choose <strong>${selections.length}/3 activities</strong><br>to improve your score
              </p>
            </div>
            ${renderStageScore(score, screenConfig.scoreShape)}
          </header>
          <div class="stage-activities__segments">
            ${renderSegmentBar(state)}
          </div>
          <div class="stage-activities__sections">
            ${screenConfig.sections
              .map((section) => {
                const cards = section.activityIds
                  .map((activityId) => activityMap[activityId])
                  .filter(Boolean);

                return `
                  <section class="stage-activities__section" data-stage-section="${section.id}">
                    ${renderSectionRibbon({
                      label: section.title,
                      tone: section.tone || screenConfig.ribbonTone
                    })}
                    <div class="stage-activities__cards">
                      ${cards
                        .map((activity) =>
                          renderActivityCard({
                            stageKey,
                            activity,
                            selections
                          })
                        )
                        .join("")}
                    </div>
                  </section>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>
      <button class="stage-activities__next" type="button" data-action="stage-next">
        Next
      </button>
    </section>
  `;
}
