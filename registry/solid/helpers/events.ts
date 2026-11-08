// global event registry
const globalListeners = new Map();

export const addGlobalEvent = (
    eventName: string,
    handler: EventListenerOrEventListenerObject,
    options: boolean | AddEventListenerOptions,
    root: Document | Window = document,
) => {
    const rootKey = root === window ? "window" : "document";
    const key = `${eventName}:${rootKey}`;

    if (!globalListeners.has(key)) {
        const handlers = new Set();

        const listener = (event: Event) => {
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

export const removeGlobalEvent = (
    eventName: string,
    handler: EventListenerOrEventListenerObject,
    root: Document | Window = document,
) => {
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
