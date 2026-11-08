import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";

import type { Color, SizeVariant } from "../../helpers/types";

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

interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: SizeVariant;
    color?: Color;
    disabled?: boolean;
    loading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Button(props: ButtonProps) {
    const [local, others] = splitProps(props, [
        "variant",
        "size",
        "color",
        "disabled",
        "loading",

        "class",
        "children",
    ]);

    const isDisabled = () => local.disabled || local.loading;

    return (
        <button
            disabled={isDisabled()}
            aria-busy={local.loading}
            class={cn(
                "btn",
                local.variant,
                local.size,
                local.color,
                local.class,
            )}
            classList={{
                loading: local.loading,
            }}
            {...others}
        >
            {local.children}
        </button>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Button };

export type {
    ButtonProps,
    Variant as ButtonVariant,
    SizeVariant as ButtonSize,
    Color as ButtonColor,
};
