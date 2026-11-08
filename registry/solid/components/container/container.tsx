import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type ContainerSize = Size | "xxl";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
    size?: ContainerSize;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Container(props: ContainerProps) {
    const [local, others] = splitProps(props, ["size", "class", "children"]);

    return (
        <div class={cn("container", local.size, local.class)} {...others}>
            {local.children}
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Container };

export type { ContainerProps, ContainerSize };
