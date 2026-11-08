const cleanupRegistry = new WeakMap();

// returns an `onCleanup(fn)` function bound to the element
export const createCleanup = (element) => {
    if (!element) {
        throw new Error("Koyaka: createCleanup requires an element.");
    }

    if (!cleanupRegistry.has(element)) {
        cleanupRegistry.set(element, []);
    }

    const callbacks = cleanupRegistry.get(element);

    return (...callback) => {
        callbacks.push(...callback);
    };
};

// runs an element's cleanups in reverse order (last registered first), then forgets them
export function disposeElement(element) {
    const callbacks = cleanupRegistry.get(element);
    if (!callbacks) return;

    cleanupRegistry.delete(element);

    for (let i = callbacks.length - 1; i >= 0; i--) {
        try {
            callbacks[i]();
        } catch (error) {
            console.error("Koyaka: cleanup failed", error, element);
        }
    }
}

// disposes a removed node and every initialized component inside it
function disposeRemovedNode(node, initAttribute) {
    if (node.nodeType !== 1 || node.isConnected) return;

    const elements = [
        ...(node.hasAttribute(initAttribute) ? [node] : []),
        ...node.querySelectorAll(`[${initAttribute}]`),
    ];

    elements.forEach((element) => {
        disposeElement(element);

        // allow re-init via refreshComponents() if the element is re-attached
        element.removeAttribute(initAttribute);
    });
}

// watches the DOM and disposes components when they are removed; returns a stop function
export function observeRemovals(
    initAttribute,
    root = document.documentElement,
) {
    const observer = new MutationObserver((mutations) => {
        for (const { removedNodes } of mutations) {
            removedNodes.forEach((node) =>
                disposeRemovedNode(node, initAttribute),
            );
        }
    });

    observer.observe(root, {
        childList: true,
        subtree: true,
    });

    return () => observer.disconnect();
}
