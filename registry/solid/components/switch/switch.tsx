import { splitProps, JSX } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SwitchProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    size?: Size;
    color?: Color;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Switch(props: SwitchProps) {
    const [local, others] = splitProps(props, [
        "type",
        "size",
        "color",

        "class",
        "children",
    ]);

    return (
        <div class={cn("switch", local.size, local.color, local.class)}>
            <input type="checkbox" {...others} />
            <span class="switch-control"></span>
            <span>{local.children}</span>
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Switch };

export type { SwitchProps };
