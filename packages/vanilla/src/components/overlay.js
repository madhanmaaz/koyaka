import {
    classListContains,
    getAttribute,
    getDataset,
    getKoyaka,
    querySelector,
    setAttribute,
    setKoyaka,
} from "../helpers/dom.js";
import { addEvent } from "../helpers/events.js";
import { createCleanup } from "../helpers/cleanup.js";
import { OverlayEngine } from "../shared/overlayEngine.js";

export function overlayHandler(overlay) {
    setAttribute(overlay, "role", "dialog");
    setAttribute(overlay, "aria-modal", "true");

    const engine = new OverlayEngine({
        root: overlay,
    });

    setKoyaka(overlay, {
        toggle: (force) => engine.toggle(force),
        open: () => engine.mount(),
        close: () => engine.unmount(),
        isOpen: () => engine.mounted,
    });

    if (classListContains(overlay, "active")) {
        engine.mount({ silent: true });
    }
}

export function overlayTriggerHandler(trigger) {
    const selector = getDataset(trigger, "targetOverlay");
    if (!selector) return;

    const onCleanup = createCleanup(trigger);
    setAttribute(trigger, "aria-haspopup", "dialog");

    onCleanup(
        addEvent(trigger, "click", (e) => {
            if (getAttribute(trigger, "href", "").startsWith("#")) {
                e.preventDefault();
            }

            const overlay = querySelector(selector);
            if (!overlay) return;

            getKoyaka(overlay).toggle?.();
        }),
    );
}
