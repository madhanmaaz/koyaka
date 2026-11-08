import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Orientation } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldType = "error" | "success" | "warning" | "info";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FieldProps extends JSX.HTMLAttributes<HTMLDivElement> {
    type?: FieldType;
    orientation?: Orientation;
}

interface FieldSetProps extends JSX.HTMLAttributes<HTMLFieldSetElement> {}
interface FieldSectionProps extends JSX.HTMLAttributes<HTMLFieldSetElement> {}
interface FieldTitleProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface FieldDescriptionProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface FieldHelpProps extends JSX.HTMLAttributes<HTMLDivElement> {}

interface FieldGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
    orientation?: Orientation;
}

// ─── Components ───────────────────────────────────────────────────────────────

function FieldSet(props: FieldSetProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <fieldset class={cn("fieldset", local.class)} {...others}>
            {local.children}
        </fieldset>
    );
}

function Field(props: FieldProps) {
    const [local, others] = splitProps(props, [
        "type",
        "orientation",

        "class",
        "children",
    ]);

    return (
        <div
            class={cn(
                "field",
                local.orientation ?? "vertical",
                local.type,
                local.class,
            )}
            {...others}
        >
            {local.children}
        </div>
    );
}

function FieldSection(props: FieldSectionProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <fieldset class={cn("field-section", local.class)} {...others}>
            {local.children}
        </fieldset>
    );
}

function FieldTitle(props: FieldTitleProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("field-title", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function FieldDescription(props: FieldDescriptionProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <p class={cn("field-description", local.class)} {...others}>
            {local.children}
        </p>
    );
}

function FieldGroup(props: FieldGroupProps) {
    const [local, others] = splitProps(props, [
        "orientation",

        "class",
        "children",
    ]);

    return (
        <div
            class={cn(
                "field-group",
                local.orientation ?? "vertical",
                local.class,
            )}
            {...others}
        >
            {local.children}
        </div>
    );
}

function FieldHelp(props: FieldHelpProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <p class={cn("help", local.class)} {...others}>
            {local.children}
        </p>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
    FieldSet,
    Field,
    FieldSection,
    FieldTitle,
    FieldDescription,
    FieldGroup,
    FieldHelp,
};

export type {
    FieldSetProps,
    FieldProps,
    FieldSectionProps,
    FieldTitleProps,
    FieldDescriptionProps,
    FieldGroupProps,
    FieldHelpProps,
    FieldType,
};
