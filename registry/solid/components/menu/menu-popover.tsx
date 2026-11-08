import { JSX, onCleanup, ParentProps, splitProps } from "solid-js";
import { FloatingEngine, useFloating } from "../../shared/floatingEngine";
import type {
    FloatingRefs,
    FloatingEngineProps,
} from "../../shared/floatingEngine";
import { cn } from "../../helpers/utils";

interface MenuPopoverProps
    extends
        Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof FloatingEngineProps>,
        Omit<FloatingEngineProps, "ignoreTrigger" | "onClickShouldClose"> {
    hoverable?: boolean;
}

interface MenuPopoverTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {}
interface MenuPopoverContentProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export function menuOnClickShouldClose(
    target: Node,
    refs: FloatingRefs,
): boolean | void {
    const element = target instanceof Element ? target : target.parentElement;
    const action = element?.closest<HTMLElement>(".menu-action");
    const isInsideContent = refs.content?.contains(target) ?? false;

    // padding, labels, separators inside the menu never close it
    if (isInsideContent && !action) return false;
    if (!action) return;

    if (isInsideContent) {
        if (action.dataset.keepOpen === "true") return false;

        // disabled items do nothing, so they shouldn't close the menu either
        if (action.matches(':disabled, .disabled, [aria-disabled="true"]')) {
            return false;
        }
    }

    // popover triggers toggle themselves (own trigger or a nested one)
    if (
        action.classList.contains("menu-popover-trigger") &&
        (isInsideContent || refs.root?.contains(action))
    ) {
        return false;
    }
}

function MenuPopover(props: ParentProps<MenuPopoverProps>) {
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
            placement={engine.placement ?? "right"}
            align={engine.align ?? "start"}
            onClickShouldClose={menuOnClickShouldClose}
        >
            <MenuPopoverRoot {...rest} />
        </FloatingEngine>
    );
}

const HOVER_DELAY = 100;

function MenuPopoverRoot(
    props: ParentProps<Omit<MenuPopoverProps, keyof FloatingEngineProps>>,
) {
    const [local, others] = splitProps(props, [
        "hoverable",
        "class",
        "children",
    ]);

    const { show, hide, isActive, setRootRef } = useFloating();

    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    onCleanup(() => {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
    });

    return (
        <div
            {...others}
            ref={setRootRef}

            class={cn(
                "menu-popover",
                local.hoverable && "hoverable",
                isActive() && "active",
                local.class,
            )}

            onMouseEnter={() => {
                if (!local.hoverable) return;

                clearTimeout(closeTimer);
                openTimer = setTimeout(show, HOVER_DELAY);
            }}
            onMouseLeave={() => {
                if (!local.hoverable) return;

                clearTimeout(openTimer);
                closeTimer = setTimeout(hide, HOVER_DELAY);
            }}
        >
            {local.children}
        </div>
    );
}

function MenuPopoverTrigger(props: MenuPopoverTriggerProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    const { setTriggerRef, toggle, isActive, show } = useFloating();

    return (
        <button
            {...others}
            ref={setTriggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={isActive()}
            class={cn("menu-popover-trigger menu-action", local.class)}
            onClick={(e) => {
                const root = e.currentTarget.closest(".menu-popover");
                if (root?.classList.contains("hoverable")) {
                    show();
                    return;
                }

                toggle();
            }}
        >
            {local.children}
        </button>
    );
}

function MenuPopoverContent(props: MenuPopoverContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    const { setContentRef, isClosing } = useFloating();

    return (
        <div
            role="menu"
            {...others}
            ref={setContentRef}
            class={cn(
                "menu-popover-content floating",
                isClosing() && "closing",
                local.class,
            )}
        >
            {local.children}
        </div>
    );
}

export { MenuPopover, MenuPopoverTrigger, MenuPopoverContent };

export type {
    MenuPopoverProps,
    MenuPopoverTriggerProps,
    MenuPopoverContentProps,
};
