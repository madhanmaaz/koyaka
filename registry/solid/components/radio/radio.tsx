import { splitProps, JSX } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RadioProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    size?: Size;
    color?: Color;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Radio(props: RadioProps) {
    const [local, others] = splitProps(props, [
        "type",
        "size",
        "color",

        "class",
        "children",
    ]);

    return (
        <div class={cn("radio", local.size, local.color, local.class)}>
            <input type="radio" {...others} />
            <span class="radio-control"></span>
            <span>{local.children}</span>
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Radio };

export type { RadioProps };
