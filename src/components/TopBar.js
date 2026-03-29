import { getSelectedAvatar } from "../utils/selectors.js";
import { getAssetStateClass } from "../utils/assets.js";

const logoAssetByVariant = {
  default: "./src/assets/logo-badge.png",
  yellow: "./src/assets/logo-badge-yellow.png"
};

export function renderTopBar(state, options = {}) {
  const { showAvatar = false, logoVariant = "default" } = options;
  const avatar = getSelectedAvatar(state);
  const avatarImagePath = avatar
    ? (avatar.nonSelectedAssetPath || avatar.assetPath)
    : "";
  const logoImagePath = logoAssetByVariant[logoVariant] || logoAssetByVariant.default;
  const logoStateClass = getAssetStateClass(logoImagePath);

  return `
    <div class="topbar" data-component="top-bar">
      <button
        class="logo-badge ${logoStateClass}"
        type="button"
        data-action="restart-flow"
        data-asset-container="logo"
        aria-label="Return to the starting screen"
      >
        <img
          class="logo-badge__image"
          data-asset-image="logo"
          src="${logoImagePath}"
          alt="Career Ready logo"
          decoding="async"
          loading="eager"
          fetchpriority="high"
        >
      </button>
      <div class="avatar-chip ${showAvatar && avatar ? "" : "hidden"}">
        ${avatar ? `
          <div
            class="avatar-chip__face ${getAssetStateClass(avatarImagePath)}"
            data-asset-container="avatar-chip"
            style="background:linear-gradient(145deg, ${avatar.colors[0]}, ${avatar.colors[1]});"
          >
            <img
              class="avatar-chip__image"
              data-asset-image="avatar-chip"
              src="${avatarImagePath}"
              alt="${avatar.name} avatar"
              decoding="async"
              loading="eager"
            >
            <span class="avatar-chip__fallback">${avatar.icon}</span>
          </div>
        ` : ""}
      </div>
    </div>
  `;
}
