import { splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { Dynamic } from "solid-js/web";

import { cn } from "../../helpers/utils";
import type { Color, Size } from "../../helpers/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DockProps extends JSX.HTMLAttributes<HTMLElement> {
    size?: Size;
    color?: Color;
}

interface DockItemProps extends JSX.HTMLAttributes<HTMLElement> {
    href?: string;

    active?: boolean;
    disabled?: boolean;
}

type DockIconProps = JSX.HTMLAttributes<HTMLSpanElement>;
type DockLabelProps = JSX.HTMLAttributes<HTMLSpanElement>;

// ─── Components ───────────────────────────────────────────────────────────────

function Dock(props: DockProps) {
    const [local, others] = splitProps(props, [
        "size",
        "color",

        "class",
        "children",
    ]);

    return (
        <nav
            {...others}
            class={cn(
                "dock",
                local.size,
                local.color,

                local.class,
            )}
        >
            {local.children}
        </nav>
    );
}

function DockItem(props: DockItemProps) {
    const [local, others] = splitProps(props, [
        "href",
        "active",
        "disabled",

        "class",
        "children",
    ]);

    return (
        <Dynamic
            component={local.href ? "a" : "button"}
            type={local.href ? undefined : "button"}
            {...others}
            href={local.disabled ? undefined : local.href}
            disabled={local.href ? undefined : local.disabled}
            aria-current={local.active ? "page" : undefined}
            aria-disabled={local.disabled ? true : undefined}
            class={cn(
                "dock-item",
                local.active ? "active" : undefined,
                local.disabled ? "disabled" : undefined,
                local.class,
            )}
        >
            {local.children}
        </Dynamic>
    );
}

function DockIcon(props: DockIconProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <span {...others} class={cn("dock-icon", local.class)}>
            {local.children}
        </span>
    );
}

function DockLabel(props: DockLabelProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <span {...others} class={cn("dock-label", local.class)}>
            {local.children}
        </span>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Dock, DockItem, DockIcon, DockLabel };

export type { DockProps, DockItemProps, DockIconProps, DockLabelProps };
