export function renderWelcomeBubble() {
  const bubblePath = "M0 0H402V252C402 276.301 384.301 294 360 294H169L131 360L93 294H42C17.699 294 0 276.301 0 252V0Z";

  return `
    <svg
      class="welcome-bubble-art"
      viewBox="0 0 402 332"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        class="welcome-bubble-art__shadow"
        d="${bubblePath}"
      />
      <path
        class="welcome-bubble-art__surface"
        d="${bubblePath}"
      />
    </svg>
  `;
}
