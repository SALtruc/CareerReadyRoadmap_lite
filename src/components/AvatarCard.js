import { getAssetStateClass } from "../utils/assets.js";

export function renderAvatarCard({ avatar, isSelected }) {
  const displayAssetPath = isSelected
    ? (avatar.selectedAssetPath || avatar.assetPath || avatar.nonSelectedAssetPath)
    : (avatar.nonSelectedAssetPath || avatar.assetPath || avatar.selectedAssetPath);
  const assetStateClass = getAssetStateClass(displayAssetPath);

  return `
    <button
      class="avatar-card ${isSelected ? "is-selected" : ""}"
      data-component="avatar-card"
      data-action="select-avatar"
      data-avatar-id="${avatar.id}"
      aria-label="Choose ${avatar.name} avatar"
      aria-pressed="${isSelected ? "true" : "false"}"
    >
      <div
        class="avatar-card__art ${assetStateClass}"
        data-asset-container="avatar"
        style="background: linear-gradient(145deg, ${avatar.colors[0]}, ${avatar.colors[1]});"
      >
        <img
          class="avatar-card__image"
          data-asset-image="avatar"
          src="${displayAssetPath}"
          alt="${avatar.name} avatar"
          decoding="async"
          loading="lazy"
          draggable="false"
        >
        <span class="avatar-card__fallback">${avatar.icon}</span>
      </div>
      ${isSelected ? '<span class="avatar-card__status" aria-hidden="true">&#10003;</span>' : ""}
    </button>
  `;
}
