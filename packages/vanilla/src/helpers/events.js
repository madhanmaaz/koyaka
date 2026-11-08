export const EVENT_VALUE_CHANGE = "koyaka:valueChange";
export const EVENT_ACTION_CLICK = "koyaka:actionClick";
export const EVENT_CONTEXT_MENU = "koyaka:contextMenu";

export const addEvent = (element, eventName, handler, options) => {
    element.addEventListener(eventName, handler, options);

    return () => {
        removeEvent(element, eventName, handler, options);
    };
};

export const removeEvent = (element, eventName, handler, options) => {
    element.removeEventListener(eventName, handler, options);
};

export const emitEvent = (element, eventName, detail = {}) => {
    return element.dispatchEvent(
        new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true,
        }),
    );
};

export function addEventDelegation({
    type,
    events,
    parent = document,
    eventOptions,
}) {
    const entries = Object.entries(events);

    function handler(e) {
        if (!(e.target instanceof Element)) return;

        for (const [selector, callback] of entries) {
            const target = e.target.closest(selector);

            // the match must be inside parent, not an ancestor of it
            if (target && parent.contains(target)) {
                callback.call(target, e);
                return;
            }
        }
    }

    parent.addEventListener(type, handler, eventOptions);

    return () => {
        parent.removeEventListener(type, handler, eventOptions);
    };
}

// global event registry
const globalListeners = new Map();

export const addGlobalEvent = (
    eventName,
    handler,
    options,
    root = document,
) => {
    const rootKey = root === window ? "window" : "document";
    const key = `${eventName}:${rootKey}`;

    if (!globalListeners.has(key)) {
        const handlers = new Set();

        const listener = (event) => {
            handlers.forEach((handler) => {
                if (typeof handler === "function") {
                    handler(event);
                }
            });
        };

        globalListeners.set(key, {
            root,
            options,
            handlers,
            listener,
        });

        root.addEventListener(eventName, listener, options);
    }

    const entry = globalListeners.get(key);
    entry.handlers.add(handler);

    return () => {
        removeGlobalEvent(eventName, handler, root);
    };
};

export const removeGlobalEvent = (eventName, handler, root = document) => {
    const rootKey = root === window ? "window" : "document";
    const key = `${eventName}:${rootKey}`;
    const entry = globalListeners.get(key);

    if (!entry) return;

    entry.handlers.delete(handler);

    if (entry.handlers.size === 0) {
        entry.root.removeEventListener(
            eventName,
            entry.listener,
            entry.options,
        );

        globalListeners.delete(key);
    }
};
