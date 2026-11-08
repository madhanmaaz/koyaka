import { getDataset, querySelector, createElement } from "../helpers/dom.js";
import { addEvent } from "../helpers/events.js";
import { createCleanup } from "../helpers/cleanup.js";

export function avatarHandler(avatar) {
    const img = querySelector("img", avatar);
    if (!img) return;

    const onCleanup = createCleanup(avatar);

    const fallbacks = getDataset(img, "fallback", "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

    let fallbackIndex = 0;

    function showPlaceholder() {
        const existing = querySelector(".avatar-placeholder", avatar);
        if (existing) return;

        const placeholder = <div class="avatar-placeholder">?</div>;
        avatar.appendChild(placeholder);
    }

    function loadNextImage() {
        img.style.opacity = "0";

        if (fallbackIndex < fallbacks.length) {
            img.src = fallbacks[fallbackIndex++];
            return;
        }

        // All fallbacks exhausted
        img.remove();
        showPlaceholder();
    }

    onCleanup(
        addEvent(img, "load", () => {
            img.style.opacity = "1";
        }),
    );

    onCleanup(addEvent(img, "error", loadNextImage));

    // Trigger fallback if image already failed before handler ran
    if (img.naturalWidth === 0 && img.complete) {
        loadNextImage();
    }
}
