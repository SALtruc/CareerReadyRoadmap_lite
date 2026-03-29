const SHAPES = {
  explore: {
    viewBox: "0 0 100 101",
    markup:
      '<path class="roadmap-stage__shape-fill" d="M50 4.5C53.4 4.5 56.6 6.3 58.3 9.2L94.8 73.3C96.5 76.2 96.5 79.8 94.8 82.7C93.1 85.6 89.9 87.4 86.5 87.4H13.5C10.1 87.4 6.9 85.6 5.2 82.7C3.5 79.8 3.5 76.2 5.2 73.3L41.7 9.2C43.4 6.3 46.6 4.5 50 4.5Z" />',
  },
  develop: {
    viewBox: "0 0 113 69",
    markup: '<rect class="roadmap-stage__shape-fill" x="4.5" y="4.5" width="104" height="60" rx="30" ry="30" />',
  },
  transition: {
    viewBox: "0 0 108 108",
    markup: '<circle class="roadmap-stage__shape-fill" cx="54" cy="54" r="49.5" />',
  },
};

export function renderRoadmapStage({ variant, number, label }) {
  const shape = SHAPES[variant];

  return `
    <div class="roadmap-stage roadmap-stage--${variant}">
      <svg class="roadmap-stage__shape" viewBox="${shape.viewBox}" aria-hidden="true" focusable="false">
        ${shape.markup}
      </svg>
      <span class="roadmap-stage__badge">${number}</span>
      <strong>${label}</strong>
    </div>
  `;
}
