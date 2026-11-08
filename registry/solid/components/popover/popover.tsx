import {
    createContext,
    createUniqueId,
    splitProps,
    useContext,
} from "solid-js";
import type { JSX, ParentProps } from "solid-js";

import { cn } from "../../helpers/utils";
import { FloatingEngine, useFloating } from "../../shared/floatingEngine";
import type { FloatingEngineProps } from "../../shared/floatingEngine";

// ─── Props ────────────────────────────────────────────────────────────────────
interface PopoverProps
    extends
        Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof FloatingEngineProps>,
        Omit<FloatingEngineProps, "ignoreTrigger" | "onClickShouldClose"> {}

type PopoverTriggerProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;
type PopoverContentProps = JSX.HTMLAttributes<HTMLDivElement>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
// keeps the user's own handler working (function or [handler, data])
function callHandler<E extends Event>(handler: unknown, e: E) {
    if (typeof handler === "function") {
        handler(e);
    } else if (Array.isArray(handler)) {
        handler[0](handler[1], e);
    }
}

// shares one id so the trigger can point at the content (aria-controls)
const PopoverContext = createContext<{ contentId: string }>();

// ─── Popover ──────────────────────────────────────────────────────────────────
function Popover(props: ParentProps<PopoverProps>) {
    const [engine, rest] = splitProps(props, [
        "placement",
        "align",
        "gap",
        "margin",

        "closeType",
        "onEscape",
        "onScroll",
        "onResize",

        "open",
        "onOpenChange",
        "defaultOpen",
    ]);

    return (
        <FloatingEngine
            {...engine}
            placement={engine.placement ?? "bottom"}
            align={engine.align ?? "center"}
            gap={engine.gap ?? 8}

            // popovers hold interactive content, so only outside clicks close them
            closeType={engine.closeType ?? "outside"}
            // the trigger toggles itself
            ignoreTrigger
        >
            <PopoverRoot {...rest} />
        </FloatingEngine>
    );
}

function PopoverRoot(
    props: ParentProps<Omit<PopoverProps, keyof FloatingEngineProps>>,
) {
    const [local, others] = splitProps(props, ["class", "children"]);
    const { setRootRef, isActive } = useFloating();

    return (
        <PopoverContext.Provider
            value={{ contentId: `popover-${createUniqueId()}` }}
        >
            <div
                {...others}
                ref={setRootRef}
                class={cn("popover", isActive() && "active", local.class)}
            >
                {local.children}
            </div>
        </PopoverContext.Provider>
    );
}

function PopoverTrigger(props: PopoverTriggerProps) {
    const [local, others] = splitProps(props, ["class", "children", "onClick"]);
    const { setTriggerRef, toggle, isActive } = useFloating();
    const ctx = useContext(PopoverContext);

    return (
        <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isActive()}
            aria-controls={ctx?.contentId}
            {...others}
            ref={setTriggerRef}
            class={cn("popover-trigger", local.class)}
            onClick={(e) => {
                callHandler(local.onClick, e);
                toggle();
            }}
        >
            {local.children}
        </button>
    );
}

function PopoverContent(props: PopoverContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    const { setContentRef, isClosing } = useFloating();
    const ctx = useContext(PopoverContext);

    return (
        <div
            id={ctx?.contentId}
            role="dialog"
            {...others}
            ref={setContentRef}
            class={cn(
                "popover-content floating",
                isClosing() && "closing",
                local.class,
            )}
        >
            {local.children}
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export { Popover, PopoverTrigger, PopoverContent };
export type { PopoverProps, PopoverTriggerProps, PopoverContentProps };
