import { avatars } from "../data/avatars.js";
import { questions } from "../data/questions.js";

export function getSelectedAvatar(state) {
  return avatars.find((avatar) => avatar.id === state.selectedAvatarId) || null;
}

export function getCurrentQuestion(state) {
  return questions[state.questionIndex] || null;
}

export function getStageQuestions(stage) {
  return questions.filter((question) => question.stage === stage);
}

export function getStageScore(state, stage) {
  const yesCount = getStageQuestions(stage).filter(
    (question) => state.answers[question.id]
  ).length;

  return yesCount * 33;
}
