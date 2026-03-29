import { renderTopBar } from "../components/TopBar.js";

const studentUnlockBoardAssetPath = "./src/assets/lite/studentUnclock/Group 195.png";
const studentUnlockBubbleAssetPath = "./src/assets/lite/studentUnclock/Bubble Chat.png";
const studentUnlockCharacterAssetPath = "./src/assets/lite/studentUnclock/Character.png";

function escapeAttribute(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderStudentUnlockScreen(state) {
  return `
    <section class="screen screen--student-unlock grid-bg bg-transition">
      ${renderTopBar(state, { showAvatar: true })}
      <div class="student-unlock-viewport">
        <div class="student-unlock">
          <form class="student-unlock__stage" data-form="student-unlock">
            <div class="student-unlock__board" data-asset-container="student-unlock-board">
              <img
                class="student-unlock__board-image"
                data-asset-image="student-unlock-board"
                src="${studentUnlockBoardAssetPath}"
                alt=""
                decoding="async"
                loading="eager"
                draggable="false"
              >
              <div class="student-unlock__field">
                <label class="sr-only" for="student-id-input">Student ID</label>
                <div class="student-unlock__input-wrap">
                  <span class="student-unlock__prefix" aria-hidden="true">S</span>
                  <input
                    id="student-id-input"
                    class="student-unlock__input"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    placeholder="1234567"
                    value="${escapeAttribute(state.studentIdDraft)}"
                    maxlength="7"
                    data-input="student-id"
                    aria-describedby="student-unlock-status"
                  >
                </div>
              </div>
            </div>
            <p
              id="student-unlock-status"
              class="student-unlock__status"
              data-student-unlock-status
              role="status"
              aria-live="polite"
            ></p>
            <input
              class="student-unlock__trap"
              type="text"
              name="website"
              tabindex="-1"
              autocomplete="off"
              data-student-unlock-trap
              aria-hidden="true"
            >
            <button
              class="student-unlock__bubble"
              type="submit"
              aria-label="Please enter your SID to unlock"
            >
              <img
                class="student-unlock__bubble-image"
                data-asset-image="student-unlock-bubble"
                src="${studentUnlockBubbleAssetPath}"
                alt=""
                decoding="async"
                loading="eager"
                draggable="false"
              >
              <span class="sr-only">Please enter your SID to unlock</span>
            </button>
          </form>
          <div class="student-unlock__character" aria-hidden="true" data-asset-container="student-unlock-character">
            <img
              class="student-unlock__character-image"
              data-asset-image="student-unlock-character"
              src="${studentUnlockCharacterAssetPath}"
              alt=""
              decoding="async"
              loading="eager"
              draggable="false"
            >
          </div>
        </div>
      </div>
    </section>
  `;
}
