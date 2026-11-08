import {
    classListAdd,
    classListRemove,
    getDataset,
    querySelector,
    querySelectorAll,
    setAttribute,
} from "../helpers/dom";
import {
    addGlobalEvent,
    emitEvent,
    EVENT_VALUE_CHANGE,
} from "../helpers/events";
import { getAnimations, lockScroll, unlockScroll } from "../helpers/utils";
import { createCleanup } from "../helpers/cleanup";
import { globalEscapeStack } from "../helpers/escapeStack";

const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    'input:not([disabled]):not([type="hidden"])',
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
].join(",");

const ON_ACTION = {
    CLOSE: "close",
    NONE: "none",
};

const ON_ACTIONS = new Set(Object.values(ON_ACTION));

// open overlays in mount order, Escape and Tab only act on the last one
const openOverlays = [];

export class OverlayEngine {
    constructor({ name, root, onEscape = ON_ACTION.CLOSE }) {
        this.name = name;
        this.root = root;

        const requestedOnEscape = getDataset(root, "onEscape", onEscape);
        this.onEscape = ON_ACTIONS.has(requestedOnEscape)
            ? requestedOnEscape
            : onEscape;

        this.mounted = false;
        this.scrollLocked = false;
        this.previousFocus = null;
        this.cleanups = [];
        this._closeId = 0;

        this._handleEscape = this._handleEscape.bind(this);
        this._handleTab = this._handleTab.bind(this);

        // registered once: runs when the element is removed or disposed
        createCleanup(root)(() => this.destroy());
    }

    get isTop() {
        return openOverlays[openOverlays.length - 1] === this;
    }

    _handleEscape(e) {
        if (e.key !== "Escape" || !this.isTop) return;
        if (!globalEscapeStack.shouldHandle(e, this)) return;

        if (this.onEscape === ON_ACTION.CLOSE) {
            this.unmount();
        }
    }

    _handleTab(e) {
        if (e.key !== "Tab" || !this.isTop) return;

        const items = querySelectorAll(FOCUSABLE, this.root).filter(
            (el) => el.getClientRects().length && !el.closest("[inert]"),
        );

        if (items.length === 0) {
            e.preventDefault();
            this.root.focus();
            return;
        }

        const first = items[0];
        const last = items[items.length - 1];
        const current = document.activeElement;

        if (!this.root.contains(current) || current === this.root) {
            e.preventDefault();
            (e.shiftKey ? last : first).focus();
        } else if (e.shiftKey && current === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && current === last) {
            e.preventDefault();
            first.focus();
        }
    }

    focus() {
        const target =
            querySelector("[autofocus]", this.root) ??
            querySelector(FOCUSABLE, this.root) ??
            this.root;

        if (target === this.root) {
            setAttribute(this.root, "tabindex", "-1");
        }

        target.focus({ preventScroll: true });
    }

    mount({ silent = false } = {}) {
        if (this.mounted) return;
        this.mounted = true;

        // cancels a pending close if we were still closing
        this._closeId++;

        if (!silent) {
            this.previousFocus = document.activeElement;
        }

        classListRemove(this.root, "closing");
        classListAdd(this.root, "active");

        openOverlays.push(this);
        globalEscapeStack.push(this);

        if (!this.scrollLocked) {
            this.scrollLocked = true;
            lockScroll();
        }

        this.cleanups.push(
            addGlobalEvent("keydown", this._handleEscape),
            addGlobalEvent("keydown", this._handleTab),
        );

        if (!silent) {
            this.focus();
            this.emitValueChange();
        }
    }

    // shared teardown for unmount() and destroy()
    _release() {
        this.mounted = false;

        const stackIndex = openOverlays.indexOf(this);
        if (stackIndex !== -1) {
            openOverlays.splice(stackIndex, 1);
        }

        globalEscapeStack.remove(this);

        this.cleanups.forEach((cleanup) => cleanup());
        this.cleanups = [];
    }

    _finish() {
        classListRemove(this.root, "active", "closing");

        if (this.scrollLocked) {
            this.scrollLocked = false;
            unlockScroll();
        }
    }

    unmount() {
        if (!this.mounted) return;

        this._release();

        // give focus back to what opened the overlay
        if (this.previousFocus?.isConnected) {
            this.previousFocus.focus({ preventScroll: true });
        }
        this.previousFocus = null;

        const closeId = ++this._closeId;

        classListAdd(this.root, "closing");

        const { hasAnimations, allSettled } = getAnimations(this.root, {
            subtree: true,
        });

        if (!hasAnimations) {
            this._finish();
        } else {
            allSettled(() => {
                // remounted while closing, so don't hide it
                if (closeId !== this._closeId) return;

                this._finish();
            });
        }

        this.emitValueChange();
    }

    // runs on element removal: no animation wait, nothing can leak
    destroy() {
        if (this.mounted) {
            this._release();
        }

        this._closeId++; // cancels any pending close callback
        this.previousFocus = null;
        this._finish();
    }

    toggle(force) {
        const shouldMount = typeof force === "boolean" ? force : !this.mounted;

        shouldMount ? this.mount() : this.unmount();
    }

    emitValueChange() {
        emitEvent(this.root, EVENT_VALUE_CHANGE, {
            mounted: this.mounted,
        });
    }
}
