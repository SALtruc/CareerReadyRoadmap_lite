export function renderSectionRibbon({ label, tone = "red" }) {
  return `
    <div class="section-ribbon section-ribbon--${tone}">
      <svg
        class="section-ribbon__shape"
        viewBox="0 0 346 58"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path class="section-ribbon__shadow" d="M0 6H346L314 32L346 58H0Z"></path>
        <path class="section-ribbon__fill" d="M0 0H346L314 26L346 52H0Z"></path>
      </svg>
      <span class="section-ribbon__label">${label}</span>
    </div>
  `;
}
