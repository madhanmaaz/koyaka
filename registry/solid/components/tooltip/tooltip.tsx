import {
    createContext,
    createUniqueId,
    onCleanup,
    Show,
    splitProps,
    useContext,
} from "solid-js";
import type { JSX, ParentProps } from "solid-js";

import { cn } from "../../helpers/utils";
import { FloatingEngine, useFloating } from "../../shared/floatingEngine";
import type { FloatingEngineProps } from "../../shared/floatingEngine";
import { Portal } from "solid-js/web";

// ─── Props ────────────────────────────────────────────────────────────────────
interface TooltipProps
    extends
        Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof FloatingEngineProps>,
        Omit<
            FloatingEngineProps,
            | "open"
            | "onOpenChange"
            | "defaultOpen"
            | "closeType"
            | "ignoreTrigger"
            | "onClickShouldClose"
        > {
    showDelay?: number;
    hideDelay?: number;
}

type TooltipTriggerProps = JSX.HTMLAttributes<HTMLSpanElement>;
type TooltipContentProps = JSX.HTMLAttributes<HTMLDivElement>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DEFAULT_SHOW_DELAY = 100;
const DEFAULT_HIDE_DELAY = 100;

// keeps the user's own handler working (function or [handler, data])
function callHandler<E extends Event>(handler: unknown, e: E) {
    if (typeof handler === "function") {
        handler(e);
    } else if (Array.isArray(handler)) {
        handler[0](handler[1], e);
    }
}

// shares the content id so the trigger can describe itself with it
const TooltipContext = createContext<{ contentId: string }>();

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tooltip(props: ParentProps<TooltipProps>) {
    const [engine, rest] = splitProps(props, [
        "placement",
        "align",
        "gap",
        "margin",

        "onEscape",
        "onScroll",
        "onResize",
    ]);

    return (
        <FloatingEngine
            {...engine}
            placement={engine.placement ?? "top"}
            gap={engine.gap ?? 10}
            // hover and focus control it, an outside tap closes it on touch
            closeType="outside"
            ignoreTrigger
        >
            <TooltipRoot {...rest} />
        </FloatingEngine>
    );
}

function TooltipRoot(
    props: ParentProps<Omit<TooltipProps, keyof FloatingEngineProps>>,
) {
    const [local, others] = splitProps(props, [
        "showDelay",
        "hideDelay",
        "class",
        "children",
    ]);
    const { show, hide, isActive, setRootRef } = useFloating();

    let timer: ReturnType<typeof setTimeout> | undefined;

    const clear = () => {
        clearTimeout(timer);
        timer = undefined;
    };

    onCleanup(clear);

    function open(delay = local.showDelay ?? DEFAULT_SHOW_DELAY) {
        clear();

        if (delay <= 0) {
            show();
            return;
        }

        timer = setTimeout(show, delay);
    }

    function close(delay = local.hideDelay ?? DEFAULT_HIDE_DELAY) {
        clear();

        if (delay <= 0) {
            hide();
            return;
        }

        timer = setTimeout(hide, delay);
    }

    // mouseenter/mouseleave ignore child elements. The content is a DOM child
    // of the root, so hovering the content keeps it open
    return (
        <TooltipContext.Provider
            value={{ contentId: `tooltip-${createUniqueId()}` }}
        >
            <div
                {...others}
                ref={setRootRef}
                class={cn("tooltip", isActive() && "active", local.class)}
                onMouseEnter={() => open()}
                onMouseLeave={() => close()}
                // keyboard: show and hide immediately
                onFocusIn={() => open(0)}
                onFocusOut={() => close(0)}
            >
                {local.children}
            </div>
        </TooltipContext.Provider>
    );
}

function TooltipTrigger(props: TooltipTriggerProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    const { setTriggerRef } = useFloating();
    const ctx = useContext(TooltipContext);

    return (
        <span
            {...others}
            ref={setTriggerRef}
            aria-describedby={ctx?.contentId}
            class={cn("tooltip-trigger", local.class)}
        >
            {local.children}
        </span>
    );
}

function TooltipContent(props: TooltipContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    const { setContentRef, isClosing, isActive } = useFloating();
    const ctx = useContext(TooltipContext);

    return (
        <Show when={isActive() || isClosing()}>
            <Portal>
                <div
                    id={ctx?.contentId}
                    role="tooltip"
                    {...others}
                    ref={setContentRef}
                    class={cn(
                        "tooltip-content floating",
                        isClosing() && "closing",
                        local.class,
                    )}
                >
                    {local.children}
                </div>
            </Portal>
        </Show>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export { Tooltip, TooltipTrigger, TooltipContent };
export type { TooltipProps, TooltipTriggerProps, TooltipContentProps };
