import {
    createComputed,
    createContext,
    createEffect,
    createMemo,
    createSignal,
    on,
    onCleanup,
    splitProps,
    useContext,
} from "solid-js";
import type { JSX, ParentProps } from "solid-js";

import { cn, getAnimations, lockScroll, unlockScroll } from "../helpers/utils";
import { globalEscapeStack } from "../helpers/escapeStack";
import { addGlobalEvent } from "../helpers/events";

type OverlayOnActionType = "close" | "none";
type OverlayBackdropVariant = "blur" | "transparent";

// ─── Context ──────────────────────────────────────────────────────────────────
interface OverlayContextValue {
    /** The requested state. Flips to false as soon as a close is requested. */
    isOpen: () => boolean;
    /** Rendered state. Stays true while the close animation plays. */
    isActive: () => boolean;
    isClosing: () => boolean;

    show: () => void;
    hide: () => void;
    toggle: () => void;

    setRootRef: (el: HTMLElement | undefined) => void;
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

type OverlayTriggerProps = JSX.HTMLAttributes<HTMLSpanElement>;
type OverlayCloseProps = JSX.HTMLAttributes<HTMLSpanElement>;

interface OverlayBackdropProps extends JSX.HTMLAttributes<HTMLDivElement> {
    variant?: OverlayBackdropVariant;
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

    const isOpen = () =>
        isControlled() ? (props.open as boolean) : internalOpen();

    // rendered from open until the close animation ends
    const [isActive, setIsActive] = createSignal(isOpen());
    const [isClosing, setIsClosing] = createSignal(false);

    function setOpen(value: boolean) {
        if (value === isOpen()) return;

        if (!isControlled()) setInternalOpen(value);
        props.onOpenChange?.(value);
    }

    // ─── Ref ──────────────────────────────────────────────────────────────────
    let root: HTMLElement | undefined;

    const setRootRef = (el: HTMLElement | undefined) => {
        root = el;
    };

    // ─── Open / close lifecycle ───────────────────────────────────────────────
    // Follows `isOpen`, so uncontrolled, controlled and an externally flipped
    // `open` prop all get the same close animation.
    // bumped on every change and on dispose, so a stale animation callback
    // can't close an overlay that was re-opened in the meantime
    let closeToken = 0;

    createComputed(
        on(isOpen, (open) => {
            const token = ++closeToken;

            if (open) {
                setIsClosing(false);
                setIsActive(true);
                return;
            }

            if (!isActive()) return;

            // .closing reaches the DOM before the microtask below runs
            setIsClosing(true);

            queueMicrotask(() => {
                if (token !== closeToken) return;

                const finish = () => {
                    if (token !== closeToken) return;

                    setIsClosing(false);
                    setIsActive(false);
                };

                const animations = root
                    ? getAnimations(root, { subtree: true })
                    : undefined;

                if (animations?.hasAnimations) {
                    animations.allSettled(finish);
                } else {
                    finish();
                }
            });
        }),
    );

    // ─── Actions ──────────────────────────────────────────────────────────────
    const show = () => setOpen(true);
    const hide = () => setOpen(false);
    const toggle = () => setOpen(!isOpen());

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

    // listeners, escape stack and focus follow the state
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
                isOpen,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
// keeps the user's own handler working (function or [handler, data])
function callHandler<E extends Event>(handler: unknown, e: E) {
    if (typeof handler === "function") {
        handler(e);
    } else if (Array.isArray(handler)) {
        handler[0](handler[1], e);
    }
}

// ─── Parts ────────────────────────────────────────────────────────────────────
interface PressableProps extends JSX.HTMLAttributes<HTMLSpanElement> {
    onPress: () => void;
}

// a non-button element that acts like a button: click, Enter and Space
function Pressable(props: PressableProps) {
    const [local, others] = splitProps(props, [
        "onPress",
        "onClick",
        "onKeyDown",
    ]);

    return (
        <span
            role="button"
            tabindex={0}
            {...others}
            onClick={(e) => {
                callHandler(local.onClick, e);
                if (!e.defaultPrevented) local.onPress();
            }}
            onKeyDown={(e) => {
                callHandler(local.onKeyDown, e);
                if (e.defaultPrevented) return;

                // a real <button> inside handles its own keys
                if (e.target !== e.currentTarget) return;

                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    local.onPress();
                }
            }}
        />
    );
}

function OverlayTrigger(props: OverlayTriggerProps) {
    const { toggle, isOpen } = useOverlay();

    return (
        <Pressable
            aria-haspopup="dialog"
            aria-expanded={isOpen()}
            {...props}
            onPress={toggle}
        />
    );
}

function OverlayClose(props: OverlayCloseProps) {
    const { hide } = useOverlay();

    return <Pressable {...props} onPress={hide} />;
}

function OverlayBackdrop(props: OverlayBackdropProps) {
    const [local, others] = splitProps(props, ["class", "variant", "onClick"]);
    const { hide } = useOverlay();

    return (
        <div
            aria-hidden="true"
            {...others}
            class={cn("overlay-backdrop", local.variant, local.class)}
            onClick={(e) => {
                callHandler(local.onClick, e);
                if (!e.defaultPrevented) hide();
            }}
        />
    );
}

export {
    useOverlay,
    OverlayEngine,
    OverlayTrigger,
    OverlayClose,
    OverlayBackdrop,
};
export type {
    OverlayEngineProps,
    OverlayContextValue,
    OverlayTriggerProps,
    OverlayCloseProps,
    OverlayBackdropProps,
    OverlayBackdropVariant,
};
