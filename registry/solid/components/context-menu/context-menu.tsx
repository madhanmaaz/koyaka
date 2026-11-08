import { splitProps } from "solid-js";
import type { JSX, ParentProps } from "solid-js";

import { cn } from "../../helpers/utils";
import { FloatingEngine, useFloating } from "../../shared/floatingEngine";
import type { FloatingEngineProps } from "../../shared/floatingEngine";
import { Menu } from "../menu";
import type { MenuProps } from "../menu";
import { menuOnClickShouldClose } from "../menu/menu-popover";

type ContextMenuProps = ParentProps<
    Omit<FloatingEngineProps, "ignoreTrigger" | "onClickShouldClose">
>;
interface ContextMenuTriggerProps extends JSX.HTMLAttributes<HTMLDivElement> {
    onContextMenu: (e: MouseEvent) => void;
}
type ContextMenuContentProps = MenuProps;

function ContextMenu(props: ContextMenuProps) {
    const [local, engine] = splitProps(props, ["children"]);

    return (
        <FloatingEngine
            {...engine}
            placement={engine.placement ?? "bottom"}
            align={engine.align ?? "start"}
            closeType={engine.closeType ?? "any"}
            onClickShouldClose={menuOnClickShouldClose}
        >
            {local.children}
        </FloatingEngine>
    );
}

// the area that listens for right-click
function ContextMenuTrigger(props: ContextMenuTriggerProps) {
    const [local, others] = splitProps(props, [
        "class",
        "children",
        "onContextMenu",
    ]);
    const { showAt, setRootRef, setTriggerRef } = useFloating();

    const setRefs = (el: HTMLDivElement) => {
        setRootRef(el);
        setTriggerRef(el);
    };

    const handleContextMenu: JSX.EventHandler<HTMLDivElement, MouseEvent> = (
        e,
    ) => {
        // keep the user's own onContextMenu working (function or [handler, data])
        const userHandler = local.onContextMenu;
        if (typeof userHandler === "function") {
            userHandler(e);
        }

        e.preventDefault();

        let x = e.clientX;
        let y = e.clientY;

        // keyboard (Shift+F10 / menu key) reports 0,0: open at the element instead
        if (x === 0 && y === 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            x = rect.left;
            y = rect.top;
        }

        showAt({ x, y });
    };

    return (
        <div
            {...others}
            ref={setRefs}
            class={cn("context-menu-trigger", local.class)}
            onContextMenu={handleContextMenu}
        >
            {local.children}
        </div>
    );
}

function ContextMenuContent(props: ContextMenuContentProps) {
    const [local, others] = splitProps(props, ["class"]);
    const { setContentRef, isActive, isClosing } = useFloating();

    return (
        <Menu
            {...others}
            ref={setContentRef}
            data-target-context-menu
            class={cn(
                "floating",
                isActive() && "active",
                isClosing() && "closing",
                local.class,
            )}
        />
    );
}

export { ContextMenu, ContextMenuTrigger, ContextMenuContent };
export type {
    ContextMenuProps,
    ContextMenuTriggerProps,
    ContextMenuContentProps,
};
