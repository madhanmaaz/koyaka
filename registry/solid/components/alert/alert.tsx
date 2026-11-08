import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Color } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = "soft" | "outline" | "faded";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AlertProps extends JSX.HTMLAttributes<HTMLDivElement> {
    variant?: Variant;
    color?: Color;
}

interface AlertContentProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface AlertTitleProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface AlertDescriptionProps extends JSX.HTMLAttributes<HTMLDivElement> {}

// ─── Components ───────────────────────────────────────────────────────────────

function Alert(props: AlertProps) {
    const [local, others] = splitProps(props, [
        "variant",
        "color",

        "class",
        "children",
    ]);

    return (
        <div
            class={cn("alert", local.color, local.variant, local.class)}
            role="alert"
            {...others}
        >
            {local.children}
        </div>
    );
}

function AlertContent(props: AlertContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    return (
        <div class={cn("alert-content", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function AlertTitle(props: AlertTitleProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    return (
        <div class={cn("alert-title", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function AlertDescription(props: AlertDescriptionProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    return (
        <div class={cn("alert-description", local.class)} {...others}>
            {local.children}
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Alert, AlertContent, AlertTitle, AlertDescription };

export type {
    AlertProps,
    AlertContentProps,
    AlertTitleProps,
    AlertDescriptionProps,
    Variant as AlertVariant,
    Color as AlertColor,
};
