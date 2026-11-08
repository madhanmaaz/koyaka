import {
    createContext,
    createEffect,
    createMemo,
    createSignal,
    on,
    onCleanup,
    useContext,
} from "solid-js";
import type { ParentProps } from "solid-js";

import { getAnimations } from "../helpers/utils";
import { computePosition } from "../helpers/positioner";
import { globalEscapeStack } from "../helpers/escapeStack";
import { addGlobalEvent } from "../helpers/events";
import type { Align, Placement } from "../helpers/types";

type FloatingCloseType = "none" | "any" | "inside" | "outside";
type FloatingOnActionType = "close" | "position" | "none";
type FloatingPoint = { x: number; y: number };

interface FloatingRefs {
    root?: HTMLElement;
    trigger?: HTMLElement;
    content?: HTMLElement;
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface FloatingContextValue {
    isActive: () => boolean;
    isClosing: () => boolean;

    show: () => void;
    hide: () => void;
    toggle: () => void;

    setRootRef: (el: HTMLElement) => void;
    setTriggerRef: (el: HTMLElement) => void;
    setContentRef: (el: HTMLElement) => void;

    showAt: (point: FloatingPoint) => void;
}

const FloatingContext = createContext<FloatingContextValue>();

function useFloating(): FloatingContextValue {
    const ctx = useContext(FloatingContext);
    if (!ctx) {
        throw new Error("useFloating must be used inside <FloatingEngine>");
    }
    return ctx;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface FloatingEngineProps {
    placement?: Placement;
    align?: Align;
    gap?: number;
    margin?: number;

    closeType?: FloatingCloseType;
    onResize?: FloatingOnActionType;
    onEscape?: FloatingOnActionType;
    onScroll?: FloatingOnActionType;

    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;

    ignoreTrigger?: boolean;

    // return false to keep it open; return nothing to use closeType
    onClickShouldClose?: (
        target: Node,
        refs: FloatingRefs,
        event: Event,
    ) => boolean | void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CLOSE_TYPE = Object.freeze({
    OUTSIDE: "outside",
    INSIDE: "inside",
    ANY: "any",
    NONE: "none",
} as const);

const ON_ACTION = Object.freeze({
    CLOSE: "close",
    POSITION: "position",
    NONE: "none",
} as const);

const PLACEMENTS = new Set<string>(["top", "bottom", "left", "right"]);
const ALIGNS = new Set<string>(["start", "center", "end"]);
const CLOSE_TYPES = new Set<string>(Object.values(CLOSE_TYPE));
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
function FloatingEngine(props: ParentProps<FloatingEngineProps>) {
    const placement = () =>
        pick<Placement>(PLACEMENTS, props.placement, "bottom" as Placement);
    const align = () => pick<Align>(ALIGNS, props.align, "center" as Align);
    const gap = () => props.gap ?? 0;
    const margin = () => props.margin ?? 14;

    const closeType = () =>
        pick<FloatingCloseType>(CLOSE_TYPES, props.closeType, CLOSE_TYPE.ANY);
    const onResize = () =>
        pick<FloatingOnActionType>(ON_ACTIONS, props.onResize, ON_ACTION.CLOSE);
    const onEscape = () =>
        pick<FloatingOnActionType>(ON_ACTIONS, props.onEscape, ON_ACTION.CLOSE);
    const onScroll = () =>
        pick<FloatingOnActionType>(ON_ACTIONS, props.onScroll, ON_ACTION.CLOSE);

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

    // ─── Refs ─────────────────────────────────────────────────────────────────
    const refs: FloatingRefs = {};

    const setRootRef = (el: HTMLElement) => {
        refs.root = el;
    };
    const setTriggerRef = (el: HTMLElement) => {
        refs.trigger = el;
    };
    const setContentRef = (el: HTMLElement) => {
        refs.content = el;
    };

    // ─── Actions ──────────────────────────────────────────────────────────────
    function applyPosition() {
        const { trigger, content } = refs;
        if (!content || (!trigger && !rectPoint)) return;

        // `translate` (not `transform`) composes with the transform animation
        // in floating.scss; a forwards-filled animation would override transform
        content.style.translate = "0px 0px";

        const position = computePosition({
            trigger,
            content,
            gap: gap(),
            margin: margin(),
            placement: placement(),
            align: align(),
            rectPoint,
        });

        content.style.translate = `${position.left}px ${position.top}px`;
    }

    // bumped on every re-open / dispose, so a stale animation callback can't close it
    let closeToken = 0;
    let rectPoint: FloatingPoint | null = null;

    function finishClose() {
        setIsClosing(false);
        setOpen(false);
    }

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

        if (!refs.content) {
            setOpen(false);
            return;
        }

        const { hasAnimations, allSettled } = getAnimations(refs.content);

        if (!hasAnimations) {
            setOpen(false);
            return;
        }

        const token = ++closeToken;
        setIsClosing(true);
        allSettled(() => {
            if (token === closeToken) finishClose();
        });
    }

    function toggle() {
        isActive() && !isClosing() ? hide() : show();
    }

    // opens at a point, or moves the open layer to it (right-click again)
    function showAt(point: FloatingPoint) {
        rectPoint = point;

        const wasActive = isActive();
        show();

        // already open (or closing): the open effect won't run, so move it now
        if (wasActive) applyPosition();
    }

    // ─── Global event handlers ────────────────────────────────────────────────
    // unique owner for the escape stack (nested floating layers close one at a time)
    const escapeOwner = {};

    function runAction(action: FloatingOnActionType) {
        if (action === ON_ACTION.CLOSE) hide();
        else if (action === ON_ACTION.POSITION) applyPosition();
    }

    function handleEscape(e: KeyboardEvent) {
        if (!globalEscapeStack.shouldHandle(e, escapeOwner)) return;

        hide();
        refs.trigger?.focus?.();
    }

    function handleScroll(e: Event) {
        // scrolling inside the content must not close or move it
        if (e.target instanceof Node && refs.content?.contains(e.target))
            return;

        runAction(onScroll());
    }

    function handleResize() {
        runAction(onResize());
    }

    function handleGlobalClick(e: Event) {
        const target = e.target;
        if (!(target instanceof Node)) return;

        if (props.onClickShouldClose?.(target, refs, e) === false) return;

        const isInside = refs.content?.contains(target) ?? false;

        if (
            props.ignoreTrigger &&
            !isInside &&
            refs.trigger?.contains(target)
        ) {
            return;
        }

        const type = closeType();

        if (
            type === CLOSE_TYPE.ANY ||
            (type === CLOSE_TYPE.INSIDE && isInside) ||
            (type === CLOSE_TYPE.OUTSIDE && !isInside)
        ) {
            hide();
        }
    }

    function isScrollbarPress(e: PointerEvent): boolean {
        const el = e.target;
        if (!(el instanceof Element)) return false;

        // the content's own scrollbar is never an outside click
        if (refs.content?.contains(el)) return false;

        // root scrollbar: clientWidth/Height exclude it, the pointer coordinates don't
        if (el === document.documentElement) {
            return e.clientX >= el.clientWidth || e.clientY >= el.clientHeight;
        }

        // any other scroll container
        const rect = el.getBoundingClientRect();

        return (
            e.clientX - rect.left >= el.clientLeft + el.clientWidth ||
            e.clientY - rect.top >= el.clientTop + el.clientHeight
        );
    }

    // clicking a scrollbar fires pointerdown but never click
    function handlePointerDown(e: Event) {
        if (isScrollbarPress(e as PointerEvent)) {
            handleGlobalClick(e);
        }
    }

    // ─── Effects ──────────────────────────────────────────────────────────────
    createEffect(
        on(isActive, (active) => {
            if (active) applyPosition();
            else rectPoint = null;
        }),
    );

    // listeners follow the state, so controlled and defaultOpen work too
    const isListening = createMemo(() => isActive() && !isClosing());

    createEffect(() => {
        if (!isListening()) return;

        const stops: Array<() => void> = [];

        if (closeType() !== CLOSE_TYPE.NONE) {
            stops.push(addGlobalEvent("click", handleGlobalClick, {}));
            stops.push(addGlobalEvent("pointerdown", handlePointerDown, {}));
        }

        if (onEscape() === ON_ACTION.CLOSE) {
            globalEscapeStack.push(escapeOwner);
            stops.push(addGlobalEvent("keydown", handleEscape, {}));
            stops.push(() => globalEscapeStack.remove(escapeOwner));
        }

        stops.push(
            addGlobalEvent(
                "scroll",
                handleScroll,
                { capture: true, passive: true },
                window,
            ),
        );
        stops.push(addGlobalEvent("resize", handleResize, false, window));

        onCleanup(() => stops.forEach((stop) => stop()));
    });

    onCleanup(() => {
        closeToken++;
    });

    return (
        <FloatingContext.Provider
            value={{
                isActive,
                isClosing,
                show,
                hide,
                toggle,

                setRootRef,
                setTriggerRef,
                setContentRef,

                showAt,
            }}
        >
            {props.children}
        </FloatingContext.Provider>
    );
}

export { useFloating, FloatingEngine };
export type { FloatingEngineProps, FloatingRefs };
