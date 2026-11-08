import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size } from "../../helpers/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProseProps extends JSX.HTMLAttributes<HTMLDivElement> {
    size?: Size;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Prose(props: ProseProps) {
    const [local, others] = splitProps(props, ["size", "class", "children"]);

    return (
        <div class={cn("prose", local.size, local.class)} {...others}>
            {local.children}
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Prose };

export type { ProseProps };
