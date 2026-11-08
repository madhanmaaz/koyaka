import { JSX, ParentProps, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = "spinner" | "arc";

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoaderProps extends JSX.HTMLAttributes<HTMLDivElement> {
    variant?: Variant;
    size?: Size;
    color?: Color;
    label?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Loader(props: ParentProps<LoaderProps>) {
    const [local, others] = splitProps(props, [
        "variant",
        "size",
        "color",
        "label",

        "class",
        "children",
    ]);

    return (
        <div
            class={cn(
                "loader",
                local.variant,
                local.size,
                local.color,
                local.class,
            )}
            role="status"
            aria-label={local.label ?? "Loading..."}
            aria-live="polite"
            {...others}
        >
            {local.children}
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────


export { Loader };

export type { LoaderProps, Variant as LoaderVariant };
