import {
    createContext,
    createEffect,
    createMemo,
    createSignal,
    onCleanup,
    useContext,
} from "solid-js";
import type { ParentProps } from "solid-js";

import { getAnimations, lockScroll, unlockScroll } from "../helpers/utils";
import { globalEscapeStack } from "../helpers/escapeStack";
import { addGlobalEvent } from "../helpers/events";

type OverlayOnActionType = "close" | "none";

// ─── Context ──────────────────────────────────────────────────────────────────
interface OverlayContextValue {
    isActive: () => boolean;
    isClosing: () => boolean;

    show: () => void;
    hide: () => void;
    toggle: () => void;

    setRootRef: (el: HTMLElement) => void;
}

const OverlayContext = createContext<OverlayContextValue>();

function useOverlay(): OverlayContextValue {
    const ctx = useContext(OverlayContext);
    if (!ctx) {
        throw new Error("useOverlay must be used inside <OverlayEngine>");
    }
    return ctx;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface OverlayEngineProps {
    onEscape?: OverlayOnActionType;

    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    'input:not([disabled]):not([type="hidden"])',
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
].join(",");

const ON_ACTION = Object.freeze({
    CLOSE: "close",
    NONE: "none",
} as const);

const ON_ACTIONS = new Set<string>(Object.values(ON_ACTION));

// invalid values fall back to the default instead of silently breaking
function pick<T extends string>(
    allowed: Set<string>,
    value: string | undefined,
    fallback: T,
): T {
    return value !== undefined && allowed.has(value) ? (value as T) : fallback;
}

// ─── Engine ───────────────────────────────────────────────────────────────────
function OverlayEngine(props: ParentProps<OverlayEngineProps>) {
    const onEscape = () =>
        pick<OverlayOnActionType>(ON_ACTIONS, props.onEscape, ON_ACTION.CLOSE);

    // ─── State ────────────────────────────────────────────────────────────────
    const isControlled = () => props.open !== undefined;
    const [internalOpen, setInternalOpen] = createSignal(
        props.defaultOpen ?? false,
    );
    const [isClosing, setIsClosing] = createSignal(false);

    // stays true while the close animation plays
    const isActive = () =>
        isControlled() ? (props.open as boolean) : internalOpen();

    function setOpen(value: boolean) {
        if (!isControlled()) setInternalOpen(value);
        props.onOpenChange?.(value);
    }

    // ─── Ref ──────────────────────────────────────────────────────────────────
    let root: HTMLElement | undefined;

    const setRootRef = (el: HTMLElement) => {
        root = el;
    };

    // ─── Actions ──────────────────────────────────────────────────────────────
    // bumped on every re-open / dispose, so a stale animation callback can't close it
    let closeToken = 0;

    function show() {
        if (isClosing()) {
            // re-opened mid close-animation: cancel the pending close
            closeToken++;
            setIsClosing(false);
            return;
        }

        if (!isActive()) setOpen(true);
    }

    function hide() {
        if (!isActive() || isClosing()) return;

        if (!root) {
            setOpen(false);
            return;
        }

        const token = ++closeToken;
        setIsClosing(true); // set .closing before getAnimations
        const { hasAnimations, allSettled } = getAnimations(root, {
            subtree: true,
        });

        if (!hasAnimations) {
            setOpen(false);
            return;
        }

        allSettled(() => {
            if (token !== closeToken) return;

            setIsClosing(false);
            setOpen(false);
        });
    }

    function toggle() {
        isActive() && !isClosing() ? hide() : show();
    }

    // ─── Focus ────────────────────────────────────────────────────────────────
    function focusInside() {
        if (!root) return;

        const target =
            root.querySelector<HTMLElement>("[autofocus]") ??
            root.querySelector<HTMLElement>(FOCUSABLE) ??
            root;

        if (target === root) root.setAttribute("tabindex", "-1");

        target.focus({ preventScroll: true });
    }

    // ─── Global event handlers ────────────────────────────────────────────────
    // unique owner for the escape stack (stacked overlays close one at a time)
    const owner = {};

    const isTop = () => globalEscapeStack.top === owner;

    function handleEscape(e: KeyboardEvent) {
        if (!globalEscapeStack.shouldHandle(e, owner)) return;

        if (onEscape() === ON_ACTION.CLOSE) hide();
    }

    function handleTab(e: KeyboardEvent) {
        if (e.key !== "Tab" || !root || !isTop()) return;

        const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
            (el) => el.getClientRects().length && !el.closest("[inert]"),
        );

        if (items.length === 0) {
            e.preventDefault();
            root.focus();
            return;
        }

        const first = items[0];
        const last = items[items.length - 1];
        const current = document.activeElement;

        if (!current || !root.contains(current) || current === root) {
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

    // ─── Effects ──────────────────────────────────────────────────────────────
    // scroll lock lasts through the close animation, and the lock is counted
    createEffect(() => {
        if (!isActive()) return;

        lockScroll();
        onCleanup(unlockScroll);
    });

    // listeners, escape stack and focus follow the state (controlled and defaultOpen work too)
    const isListening = createMemo(() => isActive() && !isClosing());

    createEffect(() => {
        if (!isListening()) return;

        const previousFocus = document.activeElement as HTMLElement | null;

        globalEscapeStack.push(owner);
        const stopEscape = addGlobalEvent("keydown", handleEscape, {});
        const stopTab = addGlobalEvent("keydown", handleTab, {});

        focusInside();

        onCleanup(() => {
            stopEscape();
            stopTab();
            globalEscapeStack.remove(owner);

            // give focus back to what opened the overlay
            if (previousFocus?.isConnected) {
                previousFocus.focus({ preventScroll: true });
            }
        });
    });

    onCleanup(() => {
        closeToken++;
    });

    return (
        <OverlayContext.Provider
            value={{
                isActive,
                isClosing,
                show,
                hide,
                toggle,

                setRootRef,
            }}
        >
            {props.children}
        </OverlayContext.Provider>
    );
}

export { useOverlay, OverlayEngine };
export type { OverlayEngineProps, OverlayContextValue };
