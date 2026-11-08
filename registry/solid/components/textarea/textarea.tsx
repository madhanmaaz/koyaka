import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type TextareaVariant = "soft" | "outline" | "faded";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TextareaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
    variant?: TextareaVariant;
    size?: Size;
    color?: Color;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Textarea(props: TextareaProps) {
    const [local, others] = splitProps(props, [
        "variant",
        "size",
        "color",

        "class",
    ]);

    return (
        <textarea
            class={cn(
                "textarea",
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

export { Textarea };

export type { TextareaProps, TextareaVariant };
