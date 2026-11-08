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

export function modalHandler(modal) {
    setAttribute(modal, "role", "dialog");
    setAttribute(modal, "aria-modal", "true");

    const engine = new OverlayEngine({
        name: "modal",
        root: modal,
    });

    setKoyaka(modal, {
        toggle: (force) => engine.toggle(force),
        open: () => engine.mount(),
        close: () => engine.unmount(),
        isOpen: () => engine.mounted,
    });

    if (classListContains(modal, "active")) {
        engine.mount({ silent: true });
    }
}

export function modalTriggerHandler(trigger) {
    const selector = getDataset(trigger, "targetModal");
    if (!selector) return;

    const onCleanup = createCleanup(trigger);
    setAttribute(trigger, "aria-haspopup", "dialog");

    onCleanup(
        addEvent(trigger, "click", (e) => {
            if (getAttribute(trigger, "href", "").startsWith("#")) {
                e.preventDefault();
            }

            const modal = querySelector(selector);
            if (!modal) return;

            getKoyaka(modal).toggle?.();
        }),
    );
}
