import { renderChooseCharacterScreen } from "./screens/ChooseCharacterScreen.js";
import { renderCareerRoadmapScreen } from "./screens/CareerRoadmapScreen.js";
import { renderExploreScreen } from "./screens/ExploreScreen.js";
import { renderQuestionDeckScreen } from "./screens/QuestionDeckScreen.js";
import { renderRoadmapScreen } from "./screens/RoadmapScreen.js";
import { renderStudentUnlockScreen } from "./screens/StudentUnlockScreen.js";
import { renderSummaryScreen } from "./screens/SummaryScreen.js";
import { renderWelcomeScreen } from "./screens/WelcomeScreen.js";

export function renderApp(state) {
  switch (state.screen) {
    case "welcome":
      return renderWelcomeScreen(state);
    case "choose-character":
      return renderChooseCharacterScreen(state);
    case "question-deck":
      return renderQuestionDeckScreen(state);
    case "roadmap":
      return renderRoadmapScreen(state);
    case "career-roadmap":
      return renderCareerRoadmapScreen(state);
    case "summary":
      return renderSummaryScreen(state);
    case "student-unlock":
      return renderStudentUnlockScreen(state);
    case "explore":
      return renderExploreScreen(state);
    default:
      return renderWelcomeScreen(state);
  }
}
