import { renderActivityCard } from "../components/ActivityCard.js";
import { renderSegmentBar } from "../components/SegmentBar.js";
import { renderTopBar } from "../components/TopBar.js";
import { activities } from "../data/activities.js";
import { stageMeta } from "../data/stages.js";
import { getStageScore } from "../utils/selectors.js";

export function renderStageDetailScreen(state) {
  const stageKey = state.activeStage;
  const stage = stageMeta[stageKey];
  const stageActivities = activities[stageKey];
  const selections = state.activitySelections[stageKey];

  return `
    <section class="screen screen--stage-detail grid-bg ${stage.detailBackground} stage-detail">
      ${renderTopBar(state, { showAvatar: true })}
      <button class="back-link" data-action="show-summary">Back to overview</button>
      <div class="stage-detail__header">
        <div>
          <h1 class="section-title">${stage.label}</h1>
          <p class="section-subtitle">You can choose <strong>3 activities</strong> to improve your score.</p>
        </div>
        <div class="stage-detail__score ${stage.shape}">
          <div>
            <small>${stage.number}</small>
            <b>${getStageScore(state, stageKey)}%</b>
          </div>
        </div>
      </div>
      ${renderSegmentBar(state)}
      <div class="stage-ribbon">${stage.ribbon}</div>
      <div class="activity-list">
        ${stageActivities
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
}
