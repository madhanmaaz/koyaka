const version = __APP_VERSION__;

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

const createLazyComponent = (componentName, handlerName) => {
    return async () => {
        return await import(`./components/${componentName}.js`).then((mod) => {
            return mod[`${handlerName ? handlerName : componentName}Handler`];
        });
    };
};

const componentRegistry = {
    ".accordion": createLazyComponent("accordion"),
    ".avatar": createLazyComponent("avatar"),
    ".menu": createLazyComponent("menu"),
    "[data-target-context-menu]": createLazyComponent("menu", "contextMenu"),
    ".modal": createLazyComponent("modal"),
    "[data-target-modal]": createLazyComponent("modal", "modalTrigger"),
    ".popover": createLazyComponent("popover"),
    ":not(input).slider": createLazyComponent("slider"),
    ".tabs": createLazyComponent("tabs"),
    ".tooltip": createLazyComponent("tooltip"),
};

function initComponents(container, registry) {
    if (!container || !registry) return;

    Object.entries(registry).forEach(([selector, mod]) => {
        const uninitializedSelector = `${selector}:not([${INIT_ATTRIBUTE}])`;

        const elements = [
            ...(container.matches?.(uninitializedSelector) ? [container] : []),
            ...container.querySelectorAll(uninitializedSelector),
        ];

        elements.forEach(async (element) => {
            element.setAttribute(INIT_ATTRIBUTE, "");

            const handler = await mod();
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
