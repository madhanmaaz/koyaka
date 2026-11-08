import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProgressProps extends JSX.ProgressHTMLAttributes<HTMLProgressElement> {
    size?: Size;
    color?: Color;
}

// ─── Components ───────────────────────────────────────────────────────────────

function Progress(props: ProgressProps) {
    const [local, others] = splitProps(props, ["size", "color", "class"]);

    return (
        <progress
            max={100}
            class={cn(
                "progress",

                local.size,
                local.color,
                local.class,
            )}
            {...others}
        />
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Progress };

export type { ProgressProps };
