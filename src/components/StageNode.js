export function renderStageNode({ stageKey, meta }) {
  return `
    <button
      class="stage-node ${meta.shape}"
      data-component="stage-node"
      data-action="open-stage-detail"
      data-stage="${stageKey}"
    >
      <div>
        <span>${meta.number}</span>
        <strong>${meta.label}</strong>
      </div>
    </button>
  `;
}
