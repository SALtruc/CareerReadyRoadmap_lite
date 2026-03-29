export function playQuestionResponseFeedback({ root, answer, sourceButton = null, origin = null }) {
  const screen = root.querySelector(".screen--question-deck");
  if (!screen) {
    return;
  }

  const type = answer ? "accept" : "reject";
  const button = sourceButton || (!origin
    ? root.querySelector(answer ? ".deck-button.accept" : ".deck-button.reject")
    : null);
  const existingParty = screen.querySelector("[data-answer-party]");
  const existingBurst = screen.querySelector("[data-answer-burst]");

  if (existingParty) {
    existingParty.remove();
  }

  if (existingBurst) {
    existingBurst.remove();
  }

  screen.classList.remove("is-answer-accept", "is-answer-reject");
  screen.classList.add(`is-answer-${type}`);

  const resolvedOrigin = resolveFeedbackOrigin({ screen, button, origin });
  const burst = createAnswerBurst(type, resolvedOrigin);
  screen.appendChild(burst);

  const party = document.createElement("div");
  party.className = `answer-party answer-party--${type}`;
  party.dataset.answerParty = "true";

  const badge = document.createElement("span");
  badge.className = "answer-party__badge";
  badge.textContent = answer ? "Yay!" : "Next!";
  party.appendChild(badge);

  const pieces = answer
    ? [
        { shape: "star", color: "#fac800", angle: -96, distance: 66, size: 20, delay: 0, spin: -40 },
        { shape: "diamond", color: "#46dcea", angle: -48, distance: 80, size: 18, delay: 26, spin: 64 },
        { shape: "dot", color: "#ffffff", angle: -14, distance: 58, size: 13, delay: 44, spin: 0 },
        { shape: "dash", color: "#fd73ed", angle: 22, distance: 82, size: 20, delay: 12, spin: 32 },
        { shape: "diamond", color: "#ffffff", angle: 56, distance: 68, size: 16, delay: 52, spin: -48 },
        { shape: "star", color: "#fac800", angle: 96, distance: 58, size: 16, delay: 22, spin: 28 }
      ]
    : [
        { shape: "star", color: "#ffb36b", angle: -104, distance: 64, size: 18, delay: 0, spin: 32 },
        { shape: "dash", color: "#ffffff", angle: -52, distance: 76, size: 18, delay: 32, spin: -20 },
        { shape: "diamond", color: "#ff5d6d", angle: -14, distance: 56, size: 16, delay: 48, spin: 42 },
        { shape: "dot", color: "#ffd6db", angle: 18, distance: 74, size: 12, delay: 18, spin: 0 },
        { shape: "dash", color: "#fac800", angle: 52, distance: 66, size: 16, delay: 54, spin: 18 },
        { shape: "diamond", color: "#ffffff", angle: 98, distance: 56, size: 15, delay: 24, spin: -32 }
      ];

  pieces.forEach((piece) => {
    const particle = document.createElement("span");
    const radians = (piece.angle * Math.PI) / 180;
    const offsetX = Math.cos(radians) * piece.distance;
    const offsetY = Math.sin(radians) * piece.distance;

    particle.className = `answer-party__piece answer-party__piece--${piece.shape}`;
    particle.style.setProperty("--size", `${piece.size}px`);
    particle.style.setProperty("--delay", `${piece.delay}ms`);
    particle.style.setProperty("--offset-x", `${offsetX.toFixed(2)}px`);
    particle.style.setProperty("--offset-y", `${offsetY.toFixed(2)}px`);
    particle.style.setProperty("--spin", `${piece.spin}deg`);
    particle.style.setProperty("--piece-color", piece.color);
    party.appendChild(particle);
  });

  if (button) {
    party.style.setProperty("--party-x", `${resolvedOrigin.x}px`);
    party.style.setProperty("--party-y", `${resolvedOrigin.y}px`);
    button.classList.remove("is-fired");
    void button.offsetWidth;
    button.classList.add("is-fired");
    window.setTimeout(() => {
      button.classList.remove("is-fired");
    }, 360);
  } else {
    party.style.setProperty("--party-x", `${resolvedOrigin.x}px`);
    party.style.setProperty("--party-y", `${resolvedOrigin.y}px`);
  }

  screen.appendChild(party);

  window.requestAnimationFrame(() => {
    burst.classList.add("is-active");
    party.classList.add("is-active");
  });

  window.setTimeout(() => {
    if (screen.isConnected) {
      screen.classList.remove("is-answer-accept", "is-answer-reject");
    }

    if (burst.isConnected) {
      burst.remove();
    }

    if (party.isConnected) {
      party.remove();
    }
  }, 620);
}

function resolveFeedbackOrigin({ screen, button, origin }) {
  if (origin && Number.isFinite(origin.x) && Number.isFinite(origin.y)) {
    return origin;
  }

  if (button) {
    const buttonRect = button.getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();

    return {
      x: buttonRect.left - screenRect.left + (buttonRect.width / 2),
      y: buttonRect.top - screenRect.top + (buttonRect.height / 2)
    };
  }

  return {
    x: screen.clientWidth * 0.5,
    y: screen.clientHeight * 0.76
  };
}

function createAnswerBurst(type, origin) {
  const burst = document.createElement("div");
  burst.className = `answer-burst answer-burst--${type}`;
  burst.dataset.answerBurst = "true";
  burst.style.setProperty("--burst-x", `${origin.x}px`);
  burst.style.setProperty("--burst-y", `${origin.y}px`);

  const pieces = type === "accept"
    ? [
        { shape: "star", color: "#fac800", angle: -88, distance: 56, size: 16, delay: 0 },
        { shape: "diamond", color: "#57d9ee", angle: -34, distance: 64, size: 14, delay: 18 },
        { shape: "dot", color: "#ffffff", angle: 10, distance: 48, size: 11, delay: 30 },
        { shape: "dash", color: "#ef70da", angle: 48, distance: 62, size: 16, delay: 8 },
        { shape: "star", color: "#ffffff", angle: 88, distance: 52, size: 12, delay: 22 }
      ]
    : [
        { shape: "star", color: "#ffb36b", angle: -90, distance: 54, size: 15, delay: 0 },
        { shape: "dash", color: "#ffffff", angle: -38, distance: 62, size: 15, delay: 16 },
        { shape: "diamond", color: "#ff5d6d", angle: 0, distance: 48, size: 13, delay: 28 },
        { shape: "dot", color: "#ffd6db", angle: 40, distance: 58, size: 11, delay: 12 },
        { shape: "diamond", color: "#fac800", angle: 86, distance: 50, size: 13, delay: 24 }
      ];

  pieces.forEach((piece) => {
    const particle = document.createElement("span");
    particle.className = `answer-burst__piece answer-burst__piece--${piece.shape}`;
    particle.style.setProperty("--size", `${piece.size}px`);
    particle.style.setProperty("--angle", `${piece.angle}deg`);
    particle.style.setProperty("--distance", `${piece.distance}px`);
    particle.style.setProperty("--delay", `${piece.delay}ms`);
    particle.style.setProperty("--piece-color", piece.color);
    burst.appendChild(particle);
  });

  return burst;
}
