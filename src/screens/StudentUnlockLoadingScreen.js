export const studentUnlockLoadingGifPath = "./src/assets/lite/loading 2.gif";

export function renderStudentUnlockLoadingScreen() {
  return `
    <section class="screen screen--student-unlock-loading grid-bg bg-transition">
      <div class="student-unlock-loading" role="status" aria-live="polite" aria-label="Loading your roadmap">
        <img
          class="student-unlock-loading__image"
          data-student-unlock-loading-gif="true"
          src="${studentUnlockLoadingGifPath}"
          alt="Loading your roadmap"
          decoding="async"
          loading="eager"
          draggable="false"
        >
      </div>
    </section>
  `;
}
