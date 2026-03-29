import { getAssetStateClass } from "../utils/assets.js";

function getFallbackIconText(activity) {
  if (activity.iconText) {
    return activity.iconText;
  }

  return activity.title
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function renderIcon(activity) {
  const iconStyle = [
    activity.iconScale ? `--activity-icon-scale:${activity.iconScale}` : "",
    activity.iconOffsetX ? `--activity-icon-offset-x:${activity.iconOffsetX}px` : "",
    activity.iconOffsetY ? `--activity-icon-offset-y:${activity.iconOffsetY}px` : ""
  ]
    .filter(Boolean)
    .join(";");
  const styleAttribute = iconStyle ? ` style="${iconStyle}"` : "";

  if (!activity.iconAssetPath) {
    return `
      <div class="stage-activity-card__icon stage-activity-card__icon--fallback" aria-hidden="true"${styleAttribute}>
        <span>${getFallbackIconText(activity)}</span>
      </div>
    `;
  }

  return `
    <div
      class="stage-activity-card__icon ${getAssetStateClass(activity.iconAssetPath)}"
      data-asset-container="activity-icon"
      aria-hidden="true"
      ${styleAttribute}
    >
      <img
        class="stage-activity-card__icon-image"
        data-asset-image="activity-icon"
        src="${activity.iconAssetPath}"
        alt="${activity.iconAlt || ""}"
        decoding="async"
        loading="lazy"
      >
      <span class="stage-activity-card__icon-fallback">${getFallbackIconText(activity)}</span>
    </div>
  `;
}

export function renderActivityCard({ stageKey, activity, selections }) {
  const isSelected = selections.includes(activity.id);
  const isDisabled = selections.length >= 3 && !isSelected;

  return `
    <button
      class="stage-activity-card ${isSelected ? "is-selected" : ""} ${isDisabled ? "is-disabled" : ""} ${activity.featured ? "stage-activity-card--featured" : ""}"
      type="button"
      data-component="activity-card"
      data-action="toggle-activity"
      data-stage="${stageKey}"
      data-activity-id="${activity.id}"
      aria-pressed="${isSelected ? "true" : "false"}"
      ${isDisabled ? "disabled" : ""}
    >
      <div class="stage-activity-card__layout">
        <div class="stage-activity-card__media">
          ${renderIcon(activity)}
        </div>
        <div class="stage-activity-card__copy">
          <h3><strong>${activity.title}</strong></h3>
          <p>${activity.descriptionHtml}</p>
          ${activity.ctaLabel ? `<span class="stage-activity-card__cta">${activity.ctaLabel}</span>` : ""}
        </div>
      </div>
      <span class="stage-activity-card__checkbox" aria-hidden="true">
        <span class="stage-activity-card__checkbox-dot"></span>
      </span>
      <span class="sr-only">${isSelected ? "Selected" : "Not selected"} ${activity.title}</span>
    </button>
  `;
}
