const version = __APP_VERSION__;

import { accordionHandler } from "./components/accordion.js";
import { avatarHandler } from "./components/avatar.js";
import { menuHandler, contextMenuHandler } from "./components/menu.js";
import { overlayHandler, overlayTriggerHandler } from "./components/overlay.js";
import { popoverHandler } from "./components/popover.js";
import { sliderHandler } from "./components/slider.js";
import { tabsHandler } from "./components/tabs.js";
import { tooltipHandler } from "./components/tooltip.js";

import {
    addEvent,
    removeEvent,
    addEventDelegation,
    addGlobalEvent,
    removeGlobalEvent,
} from "./helpers/events.js";
import { globalEscapeStack, EscapeStack } from "./helpers/escapeStack.js";
import { createElement, createIcon, getKoyaka } from "./helpers/dom.js";
import { FloatingEngine } from "./shared/floatingEngine.js";
import { computePosition } from "./helpers/positioner.js";
import { observeRemovals } from "./helpers/cleanup.js";

const INIT_ATTRIBUTE = "data-koyaka-init";

const componentRegistry = {
    ".accordion": accordionHandler,
    ".avatar": avatarHandler,
    ".menu": menuHandler,
    "[data-target-context-menu]": contextMenuHandler,
    ".modal": overlayHandler,
    ".sheet": overlayHandler,
    "[data-target-overlay]": overlayTriggerHandler,
    ".popover": popoverHandler,
    ":not(input).slider": sliderHandler,
    ".tabs": tabsHandler,
    ".tooltip": tooltipHandler,
};

function initComponents(container, registry) {
    if (!container || !registry) return;

    Object.entries(registry).forEach(([selector, handler]) => {
        const uninitializedSelector = `${selector}:not([${INIT_ATTRIBUTE}])`;

        const elements = [
            ...(container.matches?.(uninitializedSelector) ? [container] : []),
            ...container.querySelectorAll(uninitializedSelector),
        ];

        elements.forEach((element) => {
            element.setAttribute(INIT_ATTRIBUTE, "");

            handler(element);
        });
    });
}

function refreshComponents(selectors = [], container = document) {
    const registry = selectors.length === 0 ? componentRegistry : {};

    selectors.forEach((selector) => {
        const handler = componentRegistry[selector];

        if (handler) {
            registry[selector] = handler;
        }
    });

    initComponents(container, registry);
}

const stopObservingRemovals = observeRemovals(INIT_ATTRIBUTE);

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        () => initComponents(document, componentRegistry),
        { once: true },
    );
} else {
    initComponents(document, componentRegistry);
}

const KoyakaAPI = {
    version,
    refreshComponents,

    createElement,
    createIcon,
    getKoyaka,

    addEvent,
    removeEvent,
    addEventDelegation,
    addGlobalEvent,
    removeGlobalEvent,

    FloatingEngine,
    computePosition,

    globalEscapeStack,
    EscapeStack,

    stopObservingRemovals,
};

const Koyaka = Object.freeze(KoyakaAPI);

if (typeof window !== "undefined") {
    window.Koyaka = Koyaka;
}

export default Koyaka;
