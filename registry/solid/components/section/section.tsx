import { JSX, ParentProps, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size } from "../../helpers/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SectionProps extends JSX.HTMLAttributes<HTMLElement> {
    size?: Size;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Section(props: ParentProps<SectionProps>) {
    const [local, others] = splitProps(props, ["size", "class", "children"]);

    return (
        <section class={cn("section", local.size, local.class)} {...others}>
            {local.children}
        </section>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Section };

export type { SectionProps };
