import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RadialProgressProps extends JSX.HTMLAttributes<HTMLDivElement> {
    value?: number;
    size?: Size;
    color?: Color;
    thickness?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

function RadialProgress(props: RadialProgressProps) {
    const [local, others] = splitProps(props, [
        "value",
        "size",
        "color",
        "thickness",
        "style",

        "class",
        "children",
    ]);

    const value = () => Math.min(Math.max(local.value ?? 0, 0), 100);

    return (
        <div
            class={cn("radial-progress", local.size, local.color, local.class)}
            style={{
                "--value": value(),
                "--progress-thickness": local.thickness ?? 2,
                ...((local.style as JSX.CSSProperties) ?? {}),
            }}
            role="progressbar"
            aria-valuenow={value()}
            aria-valuemin={0}
            aria-valuemax={100}
            {...others}
        >
            <svg viewBox="0 0 36 36" aria-hidden="true">
                <circle
                    class="radial-track"
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                />
                <circle
                    class="radial-fill"
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    pathLength="100"
                    stroke-dasharray="100"
                    stroke-dashoffset={100 - value()}
                />
            </svg>
            <span class="radial-label" aria-hidden="true">
                {local.children ?? `${value()}%`}
            </span>
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { RadialProgress };

export type { RadialProgressProps };
