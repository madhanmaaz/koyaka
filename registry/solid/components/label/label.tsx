import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Color } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = "surface";

// ─── Props ────────────────────────────────────────────────────────────────────

interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {
    variant?: Variant;
    color?: Color;
}

interface LabelContentProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface LabelTitleProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface LabelDescriptionProps extends JSX.HTMLAttributes<HTMLDivElement> {}

// ─── Components ───────────────────────────────────────────────────────────────

function Label(props: LabelProps) {
    const [local, others] = splitProps(props, [
        "variant",
        "color",

        "class",
        "children",
    ]);

    return (
        <label
            class={cn("label", local.variant, local.class, local.color)}
            {...others}
        >
            {local.children}
        </label>
    );
}

function LabelContent(props: LabelContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("label-content", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function LabelTitle(props: LabelTitleProps) {
    const [local, others] = splitProps(props, ["class", "children"]);
    return (
        <div class={cn("label-title", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function LabelDescription(props: LabelDescriptionProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("label-description", local.class)} {...others}>
            {local.children}
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export default Object.assign(Label, {
    Content: LabelContent,
    Title: LabelTitle,
    Description: LabelDescription,
}) satisfies typeof Label & {
    Content: typeof LabelContent;
    Title: typeof LabelTitle;
    Description: typeof LabelDescription;
};

export { Label, LabelContent, LabelTitle, LabelDescription };

export type {
    LabelProps,
    LabelContentProps,
    LabelTitleProps,
    LabelDescriptionProps,
    Variant as LabelVariant,
};
