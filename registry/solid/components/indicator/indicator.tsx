import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Align, Placement } from "../../helpers/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface IndicatorProps extends JSX.HTMLAttributes<HTMLDivElement> {}

interface IndicatorItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
    placement?: Placement;
    align?: Align;
    offset?: string;
}

// ─── Components ───────────────────────────────────────────────────────────────

function Indicator(props: IndicatorProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("indicator", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function IndicatorItem(props: IndicatorItemProps) {
    const [local, others] = splitProps(props, [
        "placement",
        "align",
        "offset",

        "class",
        "children",
    ]);

    return (
        <div
            class={cn(
                "indicator-item",
                local.placement ?? "top",
                local.align ?? "end",
                local.class,
            )}
            style={{ "--indicator-offset": local.offset }}
            {...others}
        >
            {local.children}
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Indicator, IndicatorItem };

export type {
    IndicatorProps,
    IndicatorItemProps,
    Placement as IndicatorPlacement,
    Align as IndicatorAlign,
};
