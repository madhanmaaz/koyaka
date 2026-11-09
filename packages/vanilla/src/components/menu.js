import {
    classListAdd,
    classListContains,
    classListRemove,
    getDataset,
    getKoyaka,
    querySelector,
    querySelectorAll,
    setKoyaka,
} from "../helpers/dom.js";
import {
    addEvent,
    emitEvent,
    EVENT_ACTION_CLICK,
    EVENT_CONTEXT_MENU,
} from "../helpers/events.js";
import { createCleanup } from "../helpers/cleanup.js";
import { FloatingEngine } from "../shared/floatingEngine.js";

const HOVER_CLOSE_DELAY = 150;
const hoverCloseTimers = new WeakMap();

// return false to keep the menu open, anything else defers to closeType
function menuOnClickShouldClose(targetElement, engine) {
    const isInsideContent = engine.content.contains(targetElement);
    const menuAction = targetElement.closest?.(".menu-action");

    // padding, labels, separators inside the menu never close it
    if (isInsideContent && !menuAction) return false;
    if (!menuAction) return;

    if (isInsideContent && getDataset(menuAction, "keepOpen") === "true") {
        return false;
    }

    // popover triggers toggle themselves (own trigger or a nested one)
    if (
        classListContains(menuAction, "menu-popover-trigger") &&
        (isInsideContent || engine.root.contains(menuAction))
    ) {
        return false;
    }
}

function closeNestedPopovers(container) {
    querySelectorAll(".menu-popover.active", container).forEach((popover) => {
        getKoyaka(popover).floatingEngine?.unmount();
    });
}

function getPopoverEngine(popover, trigger) {
    let engine = getKoyaka(popover).floatingEngine;
    if (engine) {
        return engine;
    }

    const content = querySelector(":scope > .menu-popover-content", popover);
    trigger ??= querySelector(":scope > .menu-popover-trigger", popover);
    if (!content || !trigger) return null;

    engine = new FloatingEngine({
        name: "menu-popover",
        root: popover,
        trigger,
        content,

        placement: "right",
        align: "start",
        onClickShouldClose: menuOnClickShouldClose,
        onMount: () => {
            classListAdd(popover, "active");
        },
        onBeforeUnmount: () => {
            closeNestedPopovers(popover);
        },
        onUnmount: () => {
            classListRemove(popover, "active");
        },
    });

    // popover was written as active in the HTML
    if (classListContains(popover, "active")) {
        engine.mount();
        engine.applyPosition();
    }

    setKoyaka(popover, {
        open() {
            engine.mount();
            engine.applyPosition();
        },
        close() {
            engine.unmount();
        },
    });

    return engine;
}

function closeSiblingPopovers(popover) {
    [...(popover.parentElement?.children ?? [])].forEach((sibling) => {
        console.log(sibling);
        if (sibling === popover) return;
        if (!classListContains(sibling, "menu-popover")) return;

        getKoyaka(sibling).floatingEngine?.unmount();
    });
}

function openPopover(popover, trigger) {
    const engine = getPopoverEngine(popover, trigger);
    if (!engine) return;

    // closeSiblingPopovers(popover);

    if (!engine.mounted) {
        engine.mount();
    }

    engine.applyPosition();
}

function closePopover(popover) {
    getKoyaka(popover).floatingEngine?.unmount();
}

function cancelHoverClose(popover) {
    clearTimeout(hoverCloseTimers.get(popover));
    hoverCloseTimers.delete(popover);
}

function scheduleHoverClose(popover) {
    cancelHoverClose(popover);

    hoverCloseTimers.set(
        popover,
        setTimeout(() => closePopover(popover), HOVER_CLOSE_DELAY),
    );
}

function getHoverablePopover(menu, node) {
    const popover = node?.closest?.(".menu-popover.hoverable");

    return popover && menu.contains(popover) ? popover : null;
}

// components
export function contextMenuHandler(contextMenu) {
    const target = querySelector(
        getDataset(contextMenu, "targetContextMenu", "body"),
    );

    if (!target) return;

    const onCleanup = createCleanup(contextMenu);

    const engine = new FloatingEngine({
        name: "context-menu",
        root: target,
        trigger: target,
        content: contextMenu,
        align: "start",
        gap: 0,
        closeType: "any",
        ignoreTrigger: false, // left click on the target closes the menu
        onClickShouldClose: menuOnClickShouldClose,
        onMount: () => {
            classListAdd(contextMenu, "active");
        },
        onBeforeUnmount: () => {
            closeNestedPopovers(contextMenu);
        },
        onUnmount: () => {
            classListRemove(contextMenu, "active");
        },
    });

    function emitContextMenu(e) {
        emitEvent(contextMenu, EVENT_CONTEXT_MENU, e);
    }

    onCleanup(
        addEvent(target, "contextmenu", (e) => {
            e.preventDefault();

            engine.mount(); // no-op when already mounted
            engine.applyPosition({
                rectPoint: e,
            });
            emitContextMenu(e);
        }),
    );

    setKoyaka(contextMenu, {
        open() {
            engine.mount();
            engine.applyPosition();
        },
        close() {
            engine.unmount();
        },
    });
}

export function menuHandler(menu) {
    const onCleanup = createCleanup(menu);

    onCleanup(
        addEvent(menu, "mouseover", (e) => {
            // keep every popover in the hovered chain alive
            let ancestor = e.target.closest?.(".menu-popover");
            while (ancestor && menu.contains(ancestor)) {
                cancelHoverClose(ancestor);
                ancestor = ancestor.parentElement?.closest(".menu-popover");
            }

            const popover = getHoverablePopover(menu, e.target);
            if (!popover) return;

            const engine = getPopoverEngine(popover);
            if (!engine || engine.mounted) return;

            openPopover(popover);
        }),
    );

    onCleanup(
        addEvent(menu, "mouseout", (e) => {
            const popover = getHoverablePopover(menu, e.target);
            if (!popover) return;

            // still inside the popover (trigger fixed content are DOM children)
            if (popover.contains(e.relatedTarget)) return;

            scheduleHoverClose(popover);
        }),
    );

    onCleanup(
        addEvent(menu, "click", (e) => {
            const menuAction = e.target.closest(".menu-action");
            if (!menuAction) return;

            // href="#" would scroll the page to the top, which fires scroll and closes the menu
            if (menuAction.getAttribute("href") === "#") {
                e.preventDefault();
            }

            const emitValue = {
                value: getDataset(menuAction, "value"),
                menuProperties: {},
                menuAction,
            };

            const isPopoverTrigger = classListContains(
                menuAction,
                "menu-popover-trigger",
            );

            if (isPopoverTrigger) {
                const popover = menuAction.closest(".menu-popover");
                const engine = getPopoverEngine(popover, menuAction);

                if (engine) {
                    const isHoverable =
                        getDataset(popover, "trigger") === "hover";

                    // hoverable: click only opens (touch fires hover then click, so toggling would close it)
                    if (engine.mounted && !isHoverable) {
                        engine.unmount();
                    } else {
                        openPopover(popover, menuAction);
                    }
                }

                emitValue.menuProperties = {
                    type: "popover",
                    element: popover,
                };
                return emitEvent(menu, EVENT_ACTION_CLICK, emitValue);
            }

            const closestCollapsible = menuAction.closest(".menu-collapsible");
            if (closestCollapsible) {
                emitValue.menuProperties = {
                    type: "collapsible",
                    element: closestCollapsible,
                };

                return emitEvent(menu, EVENT_ACTION_CLICK, emitValue);
            }

            emitValue.menuProperties = { type: "menu", element: menu };
            emitEvent(menu, EVENT_ACTION_CLICK, emitValue);
        }),
    );
}
