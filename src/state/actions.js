import { stageSequence } from "../data/activities.js";
import { questions } from "../data/questions.js";
import { resetState, state } from "./store.js";

export function openChooseCharacterScreen() {
  state.screen = "choose-character";
  state.hasActivatedChooseNext = Boolean(state.selectedAvatarId);
  state.showRoadmapCheck = false;
  state.roadmapAutoAdvanceDisabled = false;
}

export function selectAvatar(avatarId) {
  state.selectedAvatarId = avatarId;
  state.hasActivatedChooseNext = true;
}

export function openQuestionDeckScreen() {
  if (!state.selectedAvatarId) {
    return;
  }

  state.screen = "question-deck";
  state.showQuestionIntro = true;
  state.swipeFeedback = null;
  state.showRoadmapCheck = false;
  state.roadmapAutoAdvanceDisabled = false;
}

export function dismissQuestionIntro() {
  state.showQuestionIntro = false;
}

export function openSummaryScreen() {
  state.screen = "summary";
  state.showRoadmapCheck = false;
  state.showStageInfo = false;
  state.roadmapVariant = "custom";
  state.hasUnlockedRoadmap = false;
}

export function openStudentUnlockScreen() {
  state.screen = "student-unlock";
  state.showRoadmapCheck = false;
  state.showStageInfo = false;
}

export function openCareerRoadmapScreen() {
  state.screen = "career-roadmap";
  state.showRoadmapCheck = false;
  state.roadmapAutoAdvanceDisabled = true;
  state.showStageInfo = false;
}

export function startCustomRoadmapFlow() {
  state.roadmapVariant = "custom";
  state.hasUnlockedRoadmap = false;
  openExploreScreen("explore", { entryScreen: "summary" });
}

export function startPremadeRoadmapFlow() {
  state.roadmapVariant = "premade";
  state.hasUnlockedRoadmap = false;
  openStudentUnlockScreen();
}

export function completeStudentUnlock() {
  state.hasUnlockedRoadmap = true;
  openCareerRoadmapScreen();
}

export function openExploreScreen(stage = "explore", options = {}) {
  const { entryScreen = null } = options;

  if (entryScreen) {
    state.exploreEntryScreen = entryScreen;
  }

  state.activeStage = stage;
  state.screen = "explore";
  state.showRoadmapCheck = false;
  state.showStageInfo = false;
}

export function openStageDetailScreen(stage) {
  openExploreScreen(stage);
}

export function showNextStage() {
  const currentIndex = stageSequence.indexOf(state.activeStage);
  const nextStage = stageSequence[currentIndex + 1];

  if (!nextStage) {
    if (!state.hasUnlockedRoadmap) {
      openStudentUnlockScreen();
      return;
    }

    openCareerRoadmapScreen();
    return;
  }

  openExploreScreen(nextStage);
}

export function showPreviousStage() {
  const currentIndex = stageSequence.indexOf(state.activeStage);

  if (currentIndex <= 0) {
    state.screen = state.exploreEntryScreen === "student-unlock"
      ? "student-unlock"
      : "summary";
    state.showRoadmapCheck = false;
    state.roadmapAutoAdvanceDisabled = false;
    state.showStageInfo = false;
    return;
  }

  openExploreScreen(stageSequence[currentIndex - 1]);
}

export function toggleStageInfo() {
  state.showStageInfo = !state.showStageInfo;
}

export function closeStageInfo() {
  state.showStageInfo = false;
}

export function setStudentIdDraft(value) {
  state.studentIdDraft = String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 7);
}

export function answerCurrentQuestion(answer) {
  const question = questions[state.questionIndex];
  if (!question) {
    return;
  }

  state.answers[question.id] = answer;
  state.swipeFeedback = null;
  state.showQuestionIntro = false;

  if (state.questionIndex === questions.length - 1) {
    state.screen = "roadmap";
    state.showRoadmapCheck = false;
    state.roadmapAutoAdvanceDisabled = false;
    return;
  }

  state.questionIndex += 1;
}

export function toggleActivitySelection(stage, activityId) {
  const selections = state.activitySelections[stage];

  if (!selections) {
    return;
  }

  const existingIndex = selections.indexOf(activityId);

  if (existingIndex >= 0) {
    selections.splice(existingIndex, 1);
    return;
  }

  if (selections.length < 3) {
    selections.push(activityId);
  }
}

export function restartFlow() {
  resetState();
}
