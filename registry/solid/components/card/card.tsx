import { JSX, splitProps } from "solid-js";

import { cn } from "../../helpers/utils";
import type { Color, ResponsiveOrientation } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = "soft" | "outline" | "faded";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
    variant?: Variant;
    orientation?: ResponsiveOrientation;
    color?: Color;
    hoverable?: boolean;
}

interface CardHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface CardContentProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface CardMediaProps extends JSX.HTMLAttributes<HTMLElement> {}

// ─── Components ───────────────────────────────────────────────────────────────
function Card(props: CardProps) {
    const [local, others] = splitProps(props, [
        "variant",
        "orientation",
        "color",
        "hoverable",

        "class",
        "children",
    ]);

    return (
        <div
            class={cn(
                "card",
                local.variant,
                local.orientation,
                local.color,
                local.class,
                local.hoverable && "hoverable",
            )}
            {...others}
        >
            {local.children}
        </div>
    );
}

function CardHeader(props: CardHeaderProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    return (
        <div class={cn("card-header", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function CardContent(props: CardContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    return (
        <div class={cn("card-content", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function CardFooter(props: CardFooterProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    return (
        <div class={cn("card-footer", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function CardMedia(props: CardMediaProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    return (
        <figure class={cn("card-media", local.class)} {...others}>
            {local.children}
        </figure>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Card, CardHeader, CardContent, CardFooter, CardMedia };

export type {
    CardProps,
    CardHeaderProps,
    CardContentProps,
    CardFooterProps,
    CardMediaProps,
    Variant as CardVariant,
};
