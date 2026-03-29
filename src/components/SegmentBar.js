import { questions } from "../data/questions.js";

const segmentPalette = [
  "#f12c2c",
  "#57d9ee",
  "#ffffff",
  "#14266d",
  "#ef70da",
  "#ffffff",
  "#57d9ee",
  "#14266d",
  "#ffde4c"
];

export function renderSegmentBar(state) {
  return `
    <div class="segment-bar" data-component="segment-bar">
      ${questions
        .map((question, index) => {
          const isCurrent =
            index === state.questionIndex && state.screen === "question-deck";
          const isDone = state.answers[question.id] !== undefined;

          return `
            <span
              class="${isCurrent ? "is-current" : ""} ${isDone ? "is-done" : ""}"
              style="background:${segmentPalette[index % segmentPalette.length]}"
            ></span>
          `;
        })
        .join("")}
    </div>
  `;
}
