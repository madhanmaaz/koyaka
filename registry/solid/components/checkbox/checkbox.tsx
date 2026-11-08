import { splitProps, JSX } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CheckboxProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    size?: Size;
    color?: Color;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Checkbox(props: CheckboxProps) {
    const [local, others] = splitProps(props, [
        "type",
        "size",
        "color",

        "class",
        "children",
    ]);

    return (
        <div class={cn("checkbox", local.size, local.color, local.class)}>
            <input type="checkbox" {...others} />
            <span class="checkbox-control"></span>
            <span>{local.children}</span>
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Checkbox };

export type { CheckboxProps };
