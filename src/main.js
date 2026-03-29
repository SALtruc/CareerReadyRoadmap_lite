import { renderApp } from "./renderApp.js";
import { avatars } from "./data/avatars.js";
import { getStageActivityAssetPaths, stageSequence } from "./data/activities.js";
import { getRoadmapAssetPaths, ROADMAP_PREMADE_ASSET_PATH } from "./data/roadmap.js";
import { questions } from "./data/questions.js";
import { exportCareerRoadmap } from "./interactions/exportCareerRoadmap.js";
import { playQuestionResponseFeedback } from "./interactions/playQuestionResponseFeedback.js";
import { setupQuestionSwipe, syncQuestionDeckHint } from "./interactions/setupQuestionSwipe.js";
import { state } from "./state/store.js";
import {
  answerCurrentQuestion,
  closeStageInfo,
  completeStudentUnlock,
  dismissQuestionIntro,
  openChooseCharacterScreen,
  openExploreScreen,
  openQuestionDeckScreen,
  openStudentUnlockScreen,
  openSummaryScreen,
  openStageDetailScreen,
  restartFlow,
  setStudentIdDraft,
  selectAvatar,
  showNextStage,
  showPreviousStage,
  startCustomRoadmapFlow,
  startPremadeRoadmapFlow,
  toggleActivitySelection,
  toggleStageInfo
} from "./state/actions.js";
import { markAssetFailed, markAssetLoaded, subscribeToAssetStateChanges, warmAssetSources } from "./utils/assets.js";

const app = document.getElementById("app");
const APP_STATE_STORAGE_KEY = "career-ready-state-v3";
const previewMode = new URLSearchParams(window.location.search).get("preview");
let roadmapCheckTimer = null;
let roadmapSummaryTimer = null;
let roadmapSequenceRunning = false;
let questionIntroTimer = null;
let previousQuestionDeckProgress = null;
let questionButtonAnswerTimer = null;
let studentUnlockRequestInFlight = false;
let activitySelectionCelebration = null;
let activitySelectionCelebrationTimer = null;
let genericPressedButton = null;
let assetDomSyncFrame = null;
const pendingAssetDomUpdates = new Map();
const logoAssetSources = [
  "./src/assets/logo-badge.png",
  "./src/assets/logo-badge-yellow.png"
];
const welcomeAssetSources = [
  "./src/assets/welcome-coach.png"
];
const summaryAssetSources = [
  "./src/assets/Map.png",
  "./src/assets/welcome-coach.png",
  "./src/assets/lite/result/Bubble Chat2.png",
  "./src/assets/lite/result/Frame 157.png",
  "./src/assets/lite/result/Frame 158.png",
  "./src/assets/lite/result/Frame 159.png",
  "./src/assets/lite/result/Frame 160.png",
  "./src/assets/lite/result/Group (9) 1.png"
];
const studentUnlockAssetSources = [
  "./src/assets/lite/studentUnclock/Group 195.png",
  "./src/assets/lite/studentUnclock/Bubble Chat.png",
  "./src/assets/lite/studentUnclock/Character.png"
];
const questionActionAssetSources = [
  "./src/assets/button/no.png",
  "./src/assets/button/yes.png"
];
const avatarAssetSources = [
  ...new Set(
    avatars.flatMap((avatar) => [
      avatar.assetPath,
      avatar.selectedAssetPath,
      avatar.nonSelectedAssetPath
    ].filter(Boolean))
  )
];
const criticalAssetSources = [...logoAssetSources, ...welcomeAssetSources];

bootstrapAppState();
warmAssetSources(criticalAssetSources);
subscribeToAssetStateChanges(({ assetPath, status }) => {
  queueMountedAssetSync(assetPath, status);
});

function render() {
  const preservedScroll = capturePreservedScroll();
  persistAppState();
  app.dataset.screen = state.screen;
  app.innerHTML = renderApp(state);
  restorePreservedScroll(preservedScroll);
  bindAssetImages();
  bindSummaryBoardMotion();
  bindQuestionDeckProgress();
  syncQuestionDeckHint(app, state.swipeFeedback);
  syncActivitySelectionCelebration();
  syncRoadmapSequence();
  syncQuestionIntroOverlay();
  warmAssetSources(getPredictiveAssetSources(state));

  if (state.screen === "student-unlock") {
    syncStudentUnlockButtonState();
  }

  if (state.screen === "question-deck") {
    setupQuestionSwipe({
      root: app,
      state,
      onAnswer: (answer) => {
        answerCurrentQuestion(answer);
        render();
      }
    });
  }
}

function bindSummaryBoardMotion() {
  const board = app.querySelector("[data-summary-board]");

  if (!board || board.dataset.bound === "true") {
    return;
  }

  board.dataset.bound = "true";

  let startX = 0;
  let startY = 0;
  let hasDragged = false;

  const setBoardVars = (clientX, clientY) => {
    const rect = board.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const nx = Math.max(-1, Math.min(1, (px - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, (py - 0.5) * 2));

    board.style.setProperty("--summary-rotate-x", `${(-ny * 4.5).toFixed(2)}deg`);
    board.style.setProperty("--summary-rotate-y", `${(nx * 5.5).toFixed(2)}deg`);
    board.style.setProperty("--explore-rotate", `${(-nx * 5 + ny * 1.6).toFixed(2)}deg`);
    board.style.setProperty("--develop-rotate", `${(nx * 6.4 - ny * 1.8).toFixed(2)}deg`);
    board.style.setProperty("--transition-rotate", `${(nx * 3.2 + ny * 1.2).toFixed(2)}deg`);
    board.style.setProperty("--explore-lift", `${(-Math.abs(ny) * 7).toFixed(2)}px`);
    board.style.setProperty("--develop-lift", `${(-Math.abs(nx) * 6.5).toFixed(2)}px`);
    board.style.setProperty("--transition-lift", `${(-Math.abs(nx) * 4.5).toFixed(2)}px`);
    board.classList.add("is-tilting");
  };

  const resetBoardVars = () => {
    board.style.setProperty("--summary-rotate-x", "0deg");
    board.style.setProperty("--summary-rotate-y", "0deg");
    board.style.setProperty("--explore-rotate", "0deg");
    board.style.setProperty("--develop-rotate", "0deg");
    board.style.setProperty("--transition-rotate", "0deg");
    board.style.setProperty("--explore-lift", "0px");
    board.style.setProperty("--develop-lift", "0px");
    board.style.setProperty("--transition-lift", "0px");
    board.classList.remove("is-tilting");
  };

  board.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
    startY = event.clientY;
    hasDragged = false;
    setBoardVars(event.clientX, event.clientY);
  });

  board.addEventListener("pointermove", (event) => {
    if (Math.abs(event.clientX - startX) > 6 || Math.abs(event.clientY - startY) > 6) {
      hasDragged = true;
    }

    setBoardVars(event.clientX, event.clientY);
  });

  board.addEventListener("pointerleave", resetBoardVars);

  board.addEventListener("pointerup", () => {
    if (hasDragged) {
      board.dataset.suppressClick = "true";
    }

    window.setTimeout(resetBoardVars, 60);
  });

  board.addEventListener("pointercancel", resetBoardVars);
}

function bindQuestionDeckProgress() {
  const fill = app.querySelector(".progress-line__fill");
  if (!fill || state.screen !== "question-deck") {
    previousQuestionDeckProgress = null;
    return;
  }

  const nextProgress = Number.parseFloat(fill.dataset.progressValue || "0");
  const startProgress =
    previousQuestionDeckProgress === null ? Math.max(0, nextProgress - (100 / questions.length)) : previousQuestionDeckProgress;

  fill.style.width = `${startProgress}%`;

  window.requestAnimationFrame(() => {
    fill.style.width = `${nextProgress}%`;
  });

  previousQuestionDeckProgress = nextProgress;
}

function syncActivitySelectionCelebration() {
  if (activitySelectionCelebrationTimer) {
    window.clearTimeout(activitySelectionCelebrationTimer);
    activitySelectionCelebrationTimer = null;
  }

  if (!activitySelectionCelebration) {
    return;
  }

  if (state.screen !== "explore") {
    activitySelectionCelebration = null;
    return;
  }

  const card = Array.from(app.querySelectorAll(".stage-activity-card")).find(
    (element) =>
      element.dataset.stage === activitySelectionCelebration.stage &&
      element.dataset.activityId === activitySelectionCelebration.activityId
  );

  if (!card) {
    activitySelectionCelebration = null;
    return;
  }

  const animationClass = activitySelectionCelebration.mode === "select"
    ? "is-celebrating"
    : "is-unselecting";

  card.classList.remove("is-celebrating", "is-unselecting");
  void card.offsetWidth;
  card.classList.add(animationClass);

  activitySelectionCelebrationTimer = window.setTimeout(() => {
    if (card.isConnected) {
      card.classList.remove(animationClass);
    }

    activitySelectionCelebration = null;
    activitySelectionCelebrationTimer = null;
  }, 360);
}

function setStudentUnlockStatus(message, tone = "") {
  const status = app.querySelector("[data-student-unlock-status]");

  if (!status) {
    return;
  }

  status.textContent = message || "";
  status.classList.toggle("is-error", tone === "error");
  status.classList.toggle("is-success", tone === "success");
}

function syncStudentUnlockButtonState() {
  const submitButton = app.querySelector(".student-unlock__bubble");

  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  const hasCompleteStudentId = String(state.studentIdDraft || "").length === 7;
  submitButton.classList.toggle("is-ready", hasCompleteStudentId);
  submitButton.disabled = studentUnlockRequestInFlight;
  submitButton.setAttribute("aria-disabled", studentUnlockRequestInFlight ? "true" : "false");
}

async function submitStudentUnlock(form) {
  if (studentUnlockRequestInFlight) {
    return;
  }

  const studentIdDigits = String(state.studentIdDraft || "").trim();
  const trapField = form.querySelector("[data-student-unlock-trap]");
  const submitButton = form.querySelector(".student-unlock__bubble");

  if (studentIdDigits.length !== 7) {
    setStudentUnlockStatus("Please enter the 7 digits after S.", "error");
    return;
  }

  studentUnlockRequestInFlight = true;
  setStudentUnlockStatus("Unlocking your roadmap...");

  if (submitButton instanceof HTMLButtonElement) {
    submitButton.classList.remove("is-celebrating");
    void submitButton.offsetWidth;
    submitButton.classList.add("is-celebrating");
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
  }

  try {
    const response = await fetch("/api/unlock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        studentId: `S${studentIdDigits}`,
        roadmapVariant: state.roadmapVariant,
        answers: state.answers,
        website: trapField instanceof HTMLInputElement ? trapField.value : ""
      })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || "We couldn't save your roadmap right now. Please try again.");
    }

    completeStudentUnlock();
    render();
  } catch (error) {
    console.error("Student unlock submission failed", error);
    setStudentUnlockStatus(
      error instanceof Error
        ? error.message
        : "We couldn't save your roadmap right now. Please try again.",
      "error"
    );
  } finally {
    studentUnlockRequestInFlight = false;

    if (submitButton instanceof HTMLButtonElement && submitButton.isConnected) {
      submitButton.removeAttribute("aria-busy");
    }

    syncStudentUnlockButtonState();
  }
}

function syncRoadmapSequence() {
  if (state.screen !== "roadmap") {
    clearRoadmapSequence();
    return;
  }

  if (state.roadmapAutoAdvanceDisabled) {
    clearRoadmapSequence();
    return;
  }

  if (roadmapSequenceRunning) {
    return;
  }

  roadmapSequenceRunning = true;

  roadmapCheckTimer = window.setTimeout(() => {
    if (state.screen !== "roadmap") {
      return;
    }

    state.showRoadmapCheck = true;
    render();
  }, 5000);

  roadmapSummaryTimer = window.setTimeout(() => {
    if (state.screen !== "roadmap") {
      return;
    }

    openSummaryScreen();
    render();
  }, 5900);
}

function clearRoadmapSequence() {
  if (roadmapCheckTimer) {
    window.clearTimeout(roadmapCheckTimer);
  }

  if (roadmapSummaryTimer) {
    window.clearTimeout(roadmapSummaryTimer);
  }

  roadmapCheckTimer = null;
  roadmapSummaryTimer = null;
  roadmapSequenceRunning = false;
}

function syncQuestionIntroOverlay() {
  clearQuestionIntroOverlaySync();

  if (state.screen !== "question-deck" || !state.showQuestionIntro) {
    return;
  }

  questionIntroTimer = window.setTimeout(() => {
    dismissQuestionIntroOverlayInPlace();
  }, 3000);

  app.addEventListener("pointerdown", handleQuestionIntroInteraction, true);
  app.addEventListener("keydown", handleQuestionIntroInteraction, true);
  app.addEventListener("wheel", handleQuestionIntroInteraction, true);
}

function clearQuestionIntroOverlaySync() {
  if (questionIntroTimer) {
    window.clearTimeout(questionIntroTimer);
  }

  questionIntroTimer = null;
  app.removeEventListener("pointerdown", handleQuestionIntroInteraction, true);
  app.removeEventListener("keydown", handleQuestionIntroInteraction, true);
  app.removeEventListener("wheel", handleQuestionIntroInteraction, true);
}

function handleQuestionIntroInteraction() {
  dismissQuestionIntroOverlayInPlace();
}

function dismissQuestionIntroOverlayInPlace() {
  if (!state.showQuestionIntro) {
    return;
  }

  dismissQuestionIntro();
  clearQuestionIntroOverlaySync();

  const overlay = app.querySelector(".question-intro");
  if (!overlay) {
    return;
  }

  overlay.classList.add("is-hiding");

  const removeOverlay = () => {
    if (overlay.isConnected) {
      overlay.remove();
    }
  };

  overlay.addEventListener("transitionend", removeOverlay, { once: true });
  window.setTimeout(removeOverlay, 220);
}

function animateQuestionDeckButtonAnswer(answer) {
  const card = app.querySelector("[data-question-card='front']");
  const stack = app.querySelector(".question-stack");
  const direction = answer ? 1 : -1;

  if (stack) {
    stack.style.setProperty("--stack-back-x", `${direction * 24}px`);
    stack.style.setProperty("--stack-back-y", "14px");
    stack.style.setProperty("--stack-back-scale", "0.99");
    stack.style.setProperty("--stack-back-opacity", "0.74");
  }

  if (!card) {
    return;
  }

  card.classList.remove("is-pressing");
  card.style.transition = "transform 240ms cubic-bezier(0.22, 0.85, 0.32, 1), opacity 180ms ease, box-shadow 180ms ease, filter 180ms ease";
  card.style.opacity = "0.93";
  card.style.filter = "none";
  card.style.boxShadow = "12px 15px 0 rgba(0, 0, 0, 0.92)";
  card.style.transform = `translate(${direction * 224}px, -20px) rotate(${direction * 14}deg) scale(1.015)`;
}

function queueQuestionButtonAnswer(answer, button) {
  if (state.screen !== "question-deck" || questionButtonAnswerTimer) {
    return;
  }

  dismissQuestionIntroOverlayInPlace();
  syncQuestionDeckHint(app, { type: answer ? "accept" : "reject" });
  animateQuestionDeckButtonAnswer(answer);
  playQuestionResponseFeedback({ root: app, answer, sourceButton: button });

  questionButtonAnswerTimer = window.setTimeout(() => {
    questionButtonAnswerTimer = null;
    answerCurrentQuestion(answer);
    render();
  }, 280);
}

function capturePreservedScroll() {
  const entries = {};

  app.querySelectorAll("[data-preserve-scroll]").forEach((element) => {
    const key = element.dataset.preserveScroll;
    if (!key) {
      return;
    }

    entries[key] = {
      top: element.scrollTop,
      left: element.scrollLeft
    };
  });

  return entries;
}

function restorePreservedScroll(entries) {
  app.querySelectorAll("[data-preserve-scroll]").forEach((element) => {
    const key = element.dataset.preserveScroll;
    const snapshot = key ? entries[key] : null;

    if (!snapshot) {
      return;
    }

    element.scrollTop = snapshot.top;
    element.scrollLeft = snapshot.left;
  });
}

function bindAssetImages() {
  app.querySelectorAll("[data-asset-image]").forEach((image) => {
    if (image.dataset.bound === "true") {
      return;
    }

    image.dataset.bound = "true";

    const container = image.closest("[data-asset-container]");

    const applyLoaded = () => {
      markAssetLoaded(image.getAttribute("src") || image.currentSrc);

      if (!container) {
        return;
      }

      container.classList.add("has-asset");
      container.classList.remove("asset-missing");
    };

    const applyMissing = () => {
      markAssetFailed(image.getAttribute("src") || image.currentSrc);

      if (!container) {
        return;
      }

      container.classList.remove("has-asset");
      container.classList.add("asset-missing");
    };

    image.addEventListener("load", applyLoaded);
    image.addEventListener("error", applyMissing);

    if (image.complete) {
      if (image.naturalWidth > 0) {
        applyLoaded();
      } else {
        applyMissing();
      }
    }
  });
}

function queueMountedAssetSync(assetPath, status) {
  if (!assetPath) {
    return;
  }

  pendingAssetDomUpdates.set(assetPath, status);

  if (assetDomSyncFrame !== null) {
    return;
  }

  assetDomSyncFrame = window.requestAnimationFrame(() => {
    assetDomSyncFrame = null;
    flushMountedAssetSync();
  });
}

function flushMountedAssetSync() {
  if (!app.isConnected || pendingAssetDomUpdates.size === 0) {
    pendingAssetDomUpdates.clear();
    return;
  }

  pendingAssetDomUpdates.forEach((status, assetPath) => {
    syncMountedAssetState(assetPath, status);
  });
  pendingAssetDomUpdates.clear();
}

function syncMountedAssetState(assetPath, status) {
  const isLoaded = status === "loaded";

  app.querySelectorAll("[data-asset-image]").forEach((image) => {
    const imagePath = image.getAttribute("src") || image.currentSrc;
    if (imagePath !== assetPath) {
      return;
    }

    const container = image.closest("[data-asset-container]");
    if (!container) {
      return;
    }

    container.classList.toggle("has-asset", isLoaded);
    container.classList.toggle("asset-missing", !isLoaded);
  });
}

function handleAppInput(event) {
  const input = event.target;

  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  if (input.dataset.input === "student-id") {
    setStudentIdDraft(input.value);
    input.value = state.studentIdDraft;
    if (state.screen === "student-unlock") {
      setStudentUnlockStatus("");
      syncStudentUnlockButtonState();
    }
  }
}

function handleAppSubmit(event) {
  const form = event.target.closest("[data-form]");
  if (!form || !app.contains(form)) {
    return;
  }

  event.preventDefault();

  if (form.dataset.form === "student-unlock") {
    void submitStudentUnlock(form);
  }
}

function getGenericFeedbackButton(target) {
  const button = target.closest("button");

  if (!button || !app.contains(button) || button.disabled) {
    return null;
  }

  if (button.matches(".stage-activity-card, .student-unlock__bubble, .deck-button")) {
    return null;
  }

  return button;
}

function clearGenericPressedButton() {
  if (!genericPressedButton) {
    return;
  }

  genericPressedButton.classList.remove("is-app-pressing");
  genericPressedButton = null;
}

function handleGenericButtonPointerDown(event) {
  const button = getGenericFeedbackButton(event.target);
  clearGenericPressedButton();

  if (!button) {
    return;
  }

  genericPressedButton = button;
  button.classList.add("is-app-pressing");
}

function triggerGenericButtonFeedback(button) {
  if (!button) {
    return;
  }

  button.classList.remove("is-app-fired");
  void button.offsetWidth;
  button.classList.add("is-app-fired");
  createGenericButtonBurst(button);

  window.setTimeout(() => {
    if (button.isConnected) {
      button.classList.remove("is-app-fired");
    }
  }, 360);
}

function handleGenericButtonClick(event) {
  const button = getGenericFeedbackButton(event.target);
  if (!button) {
    return;
  }

  triggerGenericButtonFeedback(button);
}

function createGenericButtonBurst(button) {
  const rect = button.getBoundingClientRect();
  const burst = document.createElement("div");
  burst.className = "app-button-burst";
  burst.style.left = `${rect.left + (rect.width / 2)}px`;
  burst.style.top = `${rect.top + (rect.height / 2)}px`;

  const ring = document.createElement("span");
  ring.className = "app-button-burst__ring";
  burst.appendChild(ring);

  const glow = document.createElement("span");
  glow.className = "app-button-burst__glow";
  burst.appendChild(glow);

  const pieces = [
    { shape: "star", color: "#fac800", x: -22, y: -34, size: 14, delay: 0, spin: -42 },
    { shape: "diamond", color: "#57d9ee", x: 26, y: -30, size: 13, delay: 14, spin: 38 },
    { shape: "dot", color: "#ffffff", x: 34, y: 4, size: 10, delay: 28, spin: 0 },
    { shape: "dash", color: "#ef70da", x: 18, y: 30, size: 14, delay: 8, spin: 26 },
    { shape: "diamond", color: "#ffffff", x: -24, y: 28, size: 12, delay: 22, spin: -32 },
    { shape: "star", color: "#fac800", x: -34, y: -2, size: 12, delay: 12, spin: 24 }
  ];

  pieces.forEach((piece) => {
    const particle = document.createElement("span");
    particle.className = `app-button-burst__piece app-button-burst__piece--${piece.shape}`;
    particle.style.setProperty("--size", `${piece.size}px`);
    particle.style.setProperty("--delay", `${piece.delay}ms`);
    particle.style.setProperty("--offset-x", `${piece.x}px`);
    particle.style.setProperty("--offset-y", `${piece.y}px`);
    particle.style.setProperty("--spin", `${piece.spin}deg`);
    particle.style.setProperty("--piece-color", piece.color);
    burst.appendChild(particle);
  });

  document.body.appendChild(burst);

  window.requestAnimationFrame(() => {
    burst.classList.add("is-active");
  });

  window.setTimeout(() => {
    if (burst.isConnected) {
      burst.remove();
    }
  }, 460);
}

function getQuestionContextAssetSources(questionIndex) {
  return questions
    .slice(questionIndex, questionIndex + 3)
    .map((question) => question.assetPath)
    .filter(Boolean);
}

function getSelectedRoadmapActivityIds(currentState) {
  return stageSequence.flatMap((stageKey) => currentState.activitySelections[stageKey] || []);
}

function getPredictiveAssetSources(currentState) {
  switch (currentState.screen) {
    case "welcome":
      return [...avatarAssetSources];
    case "choose-character":
      return [
        ...avatarAssetSources,
        ...questionActionAssetSources,
        ...getQuestionContextAssetSources(0)
      ];
    case "question-deck": {
      const currentQuestion = questions[currentState.questionIndex];
      const nextQuestion = questions[currentState.questionIndex + 1];
      const stageKeysToWarm = [currentQuestion?.stage, nextQuestion?.stage].filter(Boolean);

      return [
        ...questionActionAssetSources,
        ...getQuestionContextAssetSources(currentState.questionIndex),
        ...getStageActivityAssetPaths(stageKeysToWarm)
      ];
    }
    case "roadmap":
      return [...summaryAssetSources, ...studentUnlockAssetSources];
    case "summary":
      return [
        ...summaryAssetSources,
        ...studentUnlockAssetSources,
        ROADMAP_PREMADE_ASSET_PATH
      ];
    case "student-unlock":
      return currentState.roadmapVariant === "premade"
        ? [...studentUnlockAssetSources, ROADMAP_PREMADE_ASSET_PATH]
        : [
            ...studentUnlockAssetSources,
            ...getRoadmapAssetPaths(getSelectedRoadmapActivityIds(currentState))
          ];
    case "explore": {
      const activeStage = stageSequence.includes(currentState.activeStage)
        ? currentState.activeStage
        : "explore";
      const activeStageIndex = stageSequence.indexOf(activeStage);
      const nextStage = stageSequence[activeStageIndex + 1];
      const stageKeysToWarm = [activeStage, nextStage].filter(Boolean);
      const nextAssetSources = [...getStageActivityAssetPaths(stageKeysToWarm)];

      if (activeStage === "transition") {
        nextAssetSources.push(...getRoadmapAssetPaths(getSelectedRoadmapActivityIds(currentState)));
      }

      return nextAssetSources;
    }
    case "career-roadmap":
      return currentState.roadmapVariant === "premade"
        ? [ROADMAP_PREMADE_ASSET_PATH]
        : getRoadmapAssetPaths(getSelectedRoadmapActivityIds(currentState));
    default:
      return [];
  }
}

function handleAppClick(event) {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement || !app.contains(actionElement)) {
    return;
  }

  if (
    actionElement.dataset.action === "close-stage-info" &&
    actionElement.dataset.component === "stage-info-modal" &&
    event.target.closest(".stage-info-sheet, .modal-card")
  ) {
    return;
  }

  if (
    actionElement.dataset.action === "toggle-stage-info" &&
    actionElement.hasAttribute("data-summary-board") &&
    actionElement.dataset.suppressClick === "true"
  ) {
    actionElement.dataset.suppressClick = "false";
    return;
  }

  switch (actionElement.dataset.action) {
    case "start-flow":
      openChooseCharacterScreen();
      break;
    case "select-avatar":
      selectAvatar(actionElement.dataset.avatarId);
      break;
    case "begin-questions":
      openQuestionDeckScreen();
      break;
    case "dismiss-question-intro":
      dismissQuestionIntro();
      break;
    case "answer-no":
      queueQuestionButtonAnswer(false, actionElement);
      return;
    case "answer-yes":
      queueQuestionButtonAnswer(true, actionElement);
      return;
    case "start-custom-roadmap-flow":
      startCustomRoadmapFlow();
      break;
    case "start-premade-roadmap-flow":
      startPremadeRoadmapFlow();
      break;
    case "show-summary":
      openExploreScreen("explore");
      break;
    case "open-stage-detail":
      openStageDetailScreen(actionElement.dataset.stage);
      break;
    case "stage-back":
      showPreviousStage();
      break;
    case "stage-next":
      showNextStage();
      break;
    case "toggle-stage-info":
      toggleStageInfo();
      break;
    case "close-stage-info":
      closeStageInfo();
      break;
    case "toggle-activity":
      activitySelectionCelebration = {
        stage: actionElement.dataset.stage,
        activityId: actionElement.dataset.activityId,
        mode: (state.activitySelections[actionElement.dataset.stage] || []).includes(
          actionElement.dataset.activityId
        )
          ? "unselect"
          : "select"
      };
      toggleActivitySelection(
        actionElement.dataset.stage,
        actionElement.dataset.activityId
      );
      break;
    case "roadmap-back":
      if (state.roadmapVariant === "premade") {
        openStudentUnlockScreen();
      } else {
        openExploreScreen("transition", { entryScreen: state.exploreEntryScreen });
      }
      break;
    case "restart-flow":
      restartFlow();
      break;
    case "download-career-roadmap":
      void handleCareerRoadmapDownload(actionElement);
      return;
    default:
      return;
  }

  render();
}

async function handleCareerRoadmapDownload(actionElement) {
  if (actionElement.dataset.busy === "true") {
    return;
  }

  actionElement.dataset.busy = "true";
  actionElement.setAttribute("aria-busy", "true");

  try {
    await exportCareerRoadmap(state);
  } catch (error) {
    console.error(error);
    window.alert("Couldn't export your roadmap just yet. Please try again.");
  } finally {
    actionElement.dataset.busy = "false";
    actionElement.removeAttribute("aria-busy");
  }
}

function bootstrapAppState() {
  const storedState = readStoredAppState();

  if (storedState) {
    applyStateSnapshot(storedState);
  }

  if (previewMode === "roadmap") {
    applyStateSnapshot(createRoadmapPreviewState());
  }
}

function readStoredAppState() {
  try {
    const rawValue = window.localStorage.getItem(APP_STATE_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue);
  } catch (error) {
    console.warn("Failed to read saved app state", error);
    return null;
  }
}

function persistAppState() {
  try {
    window.localStorage.setItem(
      APP_STATE_STORAGE_KEY,
      JSON.stringify({
        screen: state.screen,
        selectedAvatarId: state.selectedAvatarId,
        hasActivatedChooseNext: state.hasActivatedChooseNext,
        questionIndex: state.questionIndex,
        answers: state.answers,
        activitySelections: state.activitySelections,
        activeStage: state.activeStage,
        showRoadmapCheck: state.showRoadmapCheck,
        roadmapAutoAdvanceDisabled: state.roadmapAutoAdvanceDisabled,
        roadmapVariant: state.roadmapVariant,
        hasUnlockedRoadmap: state.hasUnlockedRoadmap,
        exploreEntryScreen: state.exploreEntryScreen,
        studentIdDraft: state.studentIdDraft
      })
    );
  } catch (error) {
    console.warn("Failed to persist app state", error);
  }
}

function applyStateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    return;
  }

  const nextSelections = snapshot.activitySelections || {};

  if (typeof snapshot.screen === "string") {
    state.screen = snapshot.screen;
  }

  if (typeof snapshot.selectedAvatarId === "string") {
    state.selectedAvatarId = snapshot.selectedAvatarId;
  }

  state.hasActivatedChooseNext = Boolean(
    snapshot.hasActivatedChooseNext ?? state.selectedAvatarId
  );
  state.questionIndex = Number.isInteger(snapshot.questionIndex)
    ? Math.max(0, Math.min(questions.length - 1, snapshot.questionIndex))
    : state.questionIndex;
  state.answers = snapshot.answers && typeof snapshot.answers === "object"
    ? { ...snapshot.answers }
    : {};
  state.activitySelections = {
    explore: Array.isArray(nextSelections.explore) ? [...nextSelections.explore] : [],
    develop: Array.isArray(nextSelections.develop) ? [...nextSelections.develop] : [],
    transition: Array.isArray(nextSelections.transition) ? [...nextSelections.transition] : []
  };
  state.activeStage = typeof snapshot.activeStage === "string"
    ? snapshot.activeStage
    : state.activeStage;
  state.showRoadmapCheck = Boolean(snapshot.showRoadmapCheck);
  state.roadmapAutoAdvanceDisabled = Boolean(snapshot.roadmapAutoAdvanceDisabled);
  state.roadmapVariant = snapshot.roadmapVariant === "premade"
    ? "premade"
    : "custom";
  state.hasUnlockedRoadmap = Boolean(snapshot.hasUnlockedRoadmap);
  state.exploreEntryScreen = typeof snapshot.exploreEntryScreen === "string"
    ? snapshot.exploreEntryScreen
    : state.exploreEntryScreen;
  state.studentIdDraft = typeof snapshot.studentIdDraft === "string"
    ? snapshot.studentIdDraft.replace(/\D/g, "").slice(0, 7)
    : "";
  state.showStageInfo = false;
  state.swipeFeedback = null;
  state.showQuestionIntro = false;
}

function createRoadmapPreviewState() {
  return {
    screen: "career-roadmap",
    selectedAvatarId: "echo",
    hasActivatedChooseNext: true,
    questionIndex: questions.length - 1,
    answers: {
      "explore-1": true,
      "explore-2": true,
      "explore-3": false,
      "develop-1": true,
      "develop-2": false,
      "develop-3": false,
      "transition-1": true,
      "transition-2": true,
      "transition-3": true
    },
    activitySelections: {
      explore: ["consultation", "career-assessment", "cv-consults"],
      develop: ["linkedin-leap", "become-club-leader", "join-competition"],
      transition: ["employability-skills-workshop", "skillboost-101", "meet-your-employer"]
    },
    activeStage: "transition",
    showRoadmapCheck: false,
    roadmapAutoAdvanceDisabled: true,
    roadmapVariant: "premade",
    hasUnlockedRoadmap: true,
    exploreEntryScreen: "student-unlock",
    studentIdDraft: ""
  };
}

app.addEventListener("click", handleAppClick);
app.addEventListener("click", handleGenericButtonClick, true);
app.addEventListener("input", handleAppInput);
app.addEventListener("pointerdown", handleGenericButtonPointerDown, true);
app.addEventListener("submit", handleAppSubmit);
window.addEventListener("pointerup", clearGenericPressedButton, true);
window.addEventListener("pointercancel", clearGenericPressedButton, true);
render();
