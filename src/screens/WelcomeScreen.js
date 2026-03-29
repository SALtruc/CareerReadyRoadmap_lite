import { renderCoach } from "../components/Coach.js";
import { renderTopBar } from "../components/TopBar.js";
import { renderWelcomeBubble } from "../components/WelcomeBubble.js";

export function renderWelcomeScreen(state) {
  return `
    <section class="screen screen--welcome grid-bg bg-explore">
      <div class="welcome-panel">
        ${renderWelcomeBubble()}
        <div class="welcome-panel__content">
          ${renderTopBar(state)}
          <div class="welcome-copy">
            <h1 class="welcome-title">
              <span class="welcome-title__line">Am I...</span>
              <span class="welcome-title__line"><span class="accent">Career Ready</span> yet?</span>
            </h1>
          </div>
        </div>
      </div>
      <div class="welcome-stage">
        <div class="welcome-coach">
          ${renderCoach()}
        </div>
        <button class="welcome-start-button" data-action="start-flow">Start</button>
      </div>
    </section>
  `;
}
