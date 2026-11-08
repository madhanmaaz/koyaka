import { createCleanup } from "../helpers/cleanup.js";
import {
    classListAdd,
    classListRemove,
    querySelector,
} from "../helpers/dom.js";
import { addEvent } from "../helpers/events.js";
import { FloatingEngine } from "../shared/floatingEngine.js";

export function popoverHandler(popover) {
    const trigger = querySelector(".popover-trigger", popover);
    if (!trigger) return;

    const content = querySelector(".popover-content", popover);
    if (!content) return;

    const onCleanup = createCleanup(popover);

    const engine = new FloatingEngine({
        name: "popover",
        root: popover,
        trigger,
        content,

        placement: "bottom",
        align: "center",
        gap: 8,

        closeType: "outside",

        onMount() {
            classListAdd(popover, "active");
            classListAdd(trigger, "active");
        },
        onUnmount() {
            classListRemove(popover, "active");
            classListRemove(trigger, "active");
        },
    });

    onCleanup(
        addEvent(trigger, "click", (e) => {
            if (engine.mounted) {
                engine.unmount();
            } else {
                engine.mount();
                engine.applyPosition();
            }
        }),
    );
}
