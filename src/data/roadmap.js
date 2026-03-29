import { activities, stageSequence } from "./activities.js";
import { getStageScore } from "../utils/selectors.js";

const roadmapAssetFolder = "./src/assets/Roadmap";
const liteRoadmapAssetFolder = "./src/assets/lite";

export const ROADMAP_BACKGROUND_SIZE = {
  width: 1980,
  height: 12117
};

export const ROADMAP_PREMADE_SIZE = {
  width: 118,
  height: 1024
};

export const ROADMAP_BACKGROUND_ASSET_PATH =
  `${roadmapAssetFolder}/Background cho Roadmap.png`;

export const ROADMAP_PREMADE_ASSET_PATH =
  `${liteRoadmapAssetFolder}/lite_roadmap.jpg`;

export const ROADMAP_FACEBOOK_LINKS = {
  sgs: "https://www.facebook.com/RMITCareerReadySGS",
  hanoi: "https://www.facebook.com/RMITCareerReadyHN"
};

export const roadmapStageScoreLayout = {
  explore: { x: 458, y: 1970, fontSize: 120 },
  develop: { x: 989, y: 1970, fontSize: 120 },
  transition: { x: 1520, y: 1970, fontSize: 120 }
};

export const roadmapStageIconSlots = {
  explore: [
    { x: 480, y: 2501, maxWidth: 560, maxHeight: 560, rotate: -3, scale: 1.6 },
    { x: 1500, y: 3270, maxWidth: 560, maxHeight: 560, rotate: 3, scale: 1.8 },
    { x: 480, y: 3850, maxWidth: 560, maxHeight: 560, rotate: -3, scale: 1.6}
  ],
  develop: [
    { x: 1500, y: 5470,  maxWidth: 560, maxHeight: 560, rotate: 3, scale: 1.6 },
    { x: 480, y: 5950, maxWidth: 560, maxHeight: 560, rotate: -3, scale: 1.8 },
    { x: 1500, y: 6800, maxWidth: 560, maxHeight: 560, rotate: 3, scale: 1.6 }
  ],
  transition: [
    { x: 480, y: 7780, maxWidth: 560, maxHeight: 560, rotate: -3, scale: 1.8},
    { x: 1500, y: 8280, maxWidth: 560, maxHeight: 560, rotate: 3, scale: 1.6 },
    { x: 480, y: 9050, maxWidth: 560, maxHeight: 560, rotate: -3, scale: 1.8}
  ]
};

const roadmapAssetFileByActivityId = {
  "career-assessment": "Career Assessment.png",
  consultation: "1_1 Consultations.png",
  "cv-consults": "CV Consults.png",
  "career-online-portal": "Careers Online Portal.png",
  "career-starter-pack": "Career Starter Pack Workshop.png",
  "volunteer-program": "Volunteer Program.png",
  "career-ready-award": "Career Ready Award.png",
  "job-search-strategy": `Job Search Strategy Workshop\u00A0.png`,
  "internship-preparation": `Internship Preparation  Workshop\u00A0.png`,
  "internship-enhancement": "Internship Enhancement  Workshop.png",
  "linkedin-leap": "LinkedIn Leap.png",
  "become-club-leader": "Become Club Leader.png",
  "join-competition": "Join Competition.png",
  "employer-group-mentoring": "Employer Group Mentoring.png",
  "career-ready-hub-drop-in": `Career Ready Hub Drop-in\u00A0.png`,
  "company-visit": "Company Visit.png",
  "wil-industry-challenge-projects": "WIL-Industry  Challenge Projects.png",
  "global-experience-virtual-internships": "Virtual Internships.png",
  "application-101": "Application 101.png",
  cv360: "CV360.png",
  interview360: "Interview360.png",
  "meet-your-employer": "Meet your employer.png",
  "careers-festival": "Careers Festival.png",
  "skillboost-101": "Skillboost 101.png",
  "employability-skills-workshop": `Employability Skills Workshop\u00A0.png`,
  "alumni-mentoring": "Alumni Mentoring.png",
  "personal-branding-workshops": `Personal Branding Workshops\u00A0.png`,
  "future-ready-workshops": "Future Ready Workshops.png"
};

const activityById = Object.fromEntries(
  Object.values(activities)
    .flat()
    .map((activity) => [activity.id, activity])
);

export const roadmapActivityAssetPathById = Object.fromEntries(
  Object.entries(roadmapAssetFileByActivityId).map(([activityId, filename]) => [
    activityId,
    `${roadmapAssetFolder}/${filename}`
  ])
);

export function getRoadmapScores(state) {
  return Object.fromEntries(
    stageSequence.map((stage) => [stage, getStageScore(state, stage)])
  );
}

export function getRoadmapPosterSize(roadmapVariant = "custom") {
  return roadmapVariant === "premade" ? ROADMAP_PREMADE_SIZE : ROADMAP_BACKGROUND_SIZE;
}

export function getRoadmapSelections(state) {
  return stageSequence.flatMap((stage) =>
    (state.activitySelections[stage] || [])
      .slice(0, 3)
      .map((activityId, index) => {
        const slot = roadmapStageIconSlots[stage][index];
        const assetPath = roadmapActivityAssetPathById[activityId];
        const activity = activityById[activityId];

        if (!slot || !assetPath || !activity) {
          return null;
        }

        return {
          activityId,
          stage,
          title: activity.title,
          assetPath,
          slot
        };
      })
      .filter(Boolean)
  );
}

export function getRoadmapAssetPaths(activityIds = null) {
  const resolvedActivityIds = Array.isArray(activityIds)
    ? activityIds
    : Object.keys(roadmapActivityAssetPathById);

  return [
    ROADMAP_BACKGROUND_ASSET_PATH,
    ...new Set(
      resolvedActivityIds
        .map((activityId) => roadmapActivityAssetPathById[activityId])
        .filter(Boolean)
    )
  ];
}
