import {
    classListAdd,
    classListRemove,
    getDataset,
    querySelector,
    setAttribute,
    setKoyaka,
} from "../helpers/dom.js";
import { addEvent } from "../helpers/events.js";
import { FloatingEngine } from "../shared/floatingEngine.js";
import { createCleanup } from "../helpers/cleanup.js";
import { uid } from "../helpers/utils.js";

const DEFAULT_SHOW_DELAY = 500;
const DEFAULT_HIDE_DELAY = 0;

export function tooltipHandler(tooltip) {
    const content = querySelector(":scope > .tooltip-content", tooltip);
    if (!content) return;

    const trigger = querySelector(":scope > .tooltip-trigger", tooltip);
    if (!trigger) return;

    const onCleanup = createCleanup(tooltip);

    const showDelay = Number(
        getDataset(tooltip, "showDelay", DEFAULT_SHOW_DELAY),
    );
    const hideDelay = Number(
        getDataset(tooltip, "hideDelay", DEFAULT_HIDE_DELAY),
    );

    // A11Y
    content.id ||= `tooltip-${uid()}`;
    setAttribute(content, "role", "tooltip");
    setAttribute(trigger, "aria-describedby", content.id);

    let timer = null;

    const clearTimer = () => {
        clearTimeout(timer);
        timer = null;
    };

    const engine = new FloatingEngine({
        name: "tooltip",
        root: tooltip,
        trigger,
        content,
        placement: "top",
        align: "center",
        gap: 6,
        // touch: a tap outside closes it. hover and focus handle the rest
        closeType: "outside",
        onMount() {
            classListAdd(tooltip, "active");
        },
        onBeforeUnmount() {
            clearTimer();
        },
        onUnmount() {
            classListRemove(tooltip, "active");
        },
    });

    function show(delay = showDelay) {
        clearTimer();

        // already open, only cancel a pending hide
        if (engine.mounted) return;

        timer = setTimeout(() => {
            timer = null;

            engine.mount();
            engine.applyPosition();
        }, delay);
    }

    function hide(delay = hideDelay) {
        clearTimer();

        if (!engine.mounted) return;

        timer = setTimeout(() => {
            timer = null;

            engine.unmount();
        }, delay);
    }

    // mouseenter/mouseleave ignore child elements. The content is a DOM child
    // of the tooltip, so hovering the content keeps it open
    onCleanup(addEvent(tooltip, "mouseenter", () => show()));
    onCleanup(addEvent(tooltip, "mouseleave", () => hide()));

    // keyboard: show immediately
    onCleanup(addEvent(tooltip, "focusin", () => show(0)));
    onCleanup(addEvent(tooltip, "focusout", () => hide(0)));

    setKoyaka(tooltip, {
        floatingEngine: engine,
        show: () => show(0),
        hide: () => hide(0),
    });
}
