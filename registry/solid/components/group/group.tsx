import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Orientation } from "../../helpers/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface GroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
    orientation?: Orientation;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Group(props: GroupProps) {
    const [local, others] = splitProps(props, [
        "orientation",

        "class",
        "children",
    ]);

    return (
        <div class={cn("group", local.orientation, local.class)} {...others}>
            {local.children}
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Group };

export type { GroupProps };
