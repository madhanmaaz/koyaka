import { JSX, splitProps } from "solid-js";

import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant =
    | "soft"
    | "outline"
    | "faded"
    | "ghost"
    | "link"
    | "ghost-soft"
    | "ghost-outline"
    | "ghost-faded";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
    variant?: Variant;
    size?: Size;
    color?: Color;
    iconOnly?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
function Badge(props: BadgeProps) {
    const [local, others] = splitProps(props, [
        "variant",
        "size",
        "color",
        "iconOnly",

        "class",
        "children",
    ]);

    return (
        <span
            class={cn(
                "badge",
                local.variant,
                local.size,
                local.color,
                local.iconOnly && "icon-only",
                local.class,
            )}
            {...others}
        >
            {local.children}
        </span>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Badge };

export type {
    BadgeProps,
    Variant as BadgeVariant,
    Size as BadgeSize,
    Color as BadgeColor,
};
