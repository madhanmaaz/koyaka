import { JSX, splitProps } from "solid-js";

import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = "soft" | "outline" | "faded";

// ─── Props ────────────────────────────────────────────────────────────────────

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    variant?: Variant;
    size?: Size;
    color?: Color;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Input(props: InputProps) {
    const [local, others] = splitProps(props, [
        "variant",
        "size",
        "color",
        "class",
    ]);

    return (
        <input
            class={cn(
                "input",
                local.variant,
                local.size,
                local.color,
                local.class,
            )}
            {...others}
        />
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Input };

export type { InputProps, Variant as InputVariant };
