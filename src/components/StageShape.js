export function renderStageShape({
  stageKey,
  meta,
  score = null,
  interactive = false,
  action = null,
  extraClass = "",
  showScore = score !== null && score !== undefined
}) {
  const tag = interactive ? "button" : "div";
  const actionAttrs = interactive && action
    ? `type="button" data-action="${action}" data-stage="${stageKey}"`
    : "";
  const scoreMarkup = showScore
    ? `<b class="summary-shape__score">${score}%</b>`
    : "";

  return `
    <${tag}
      class="summary-shape ${stageKey}${extraClass ? ` ${extraClass}` : ""}"
      data-component="summary-shape"
      data-stage="${stageKey}"
      ${actionAttrs}
    >
      <span class="summary-shape__badge">${meta.number}</span>
      <div class="summary-shape__content${showScore ? "" : " summary-shape__content--label-only"}">
        <strong class="summary-shape__label">${meta.label}</strong>
        ${scoreMarkup}
      </div>
    </${tag}>
  `;
}
