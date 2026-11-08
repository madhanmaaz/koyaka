import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatusProps extends JSX.HTMLAttributes<HTMLSpanElement> {
    size?: Size;
    color?: Color;
    animate?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Status(props: StatusProps) {
    const [local, others] = splitProps(props, [
        "size",
        "color",
        "animate",
        "class",
    ]);

    return (
        <span
            role="status"
            aria-label={local.animate ? "Loading" : undefined}
            class={cn("status", local.size, local.color, local.class)}
            classList={{
                animate: local.animate,
            }}
            {...others}
        />
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Status };

export type { StatusProps };
