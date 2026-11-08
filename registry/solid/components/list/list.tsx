import { JSX, ParentProps, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size, Orientation } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = "surface" | "split";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ListProps extends JSX.HTMLAttributes<HTMLDivElement> {
    variant?: Variant;
    size?: Size;
    orientation?: Orientation;
}

interface ListItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    active?: boolean;
}

interface ListLabelProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface ListContentProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface ListStartProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface ListEndProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface ListTitleProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface ListDescriptionProps extends JSX.HTMLAttributes<HTMLDivElement> {}

// ─── Components ───────────────────────────────────────────────────────────────

function List(props: ParentProps<ListProps>) {
    const [local, others] = splitProps(props, [
        "variant",
        "size",
        "orientation",

        "class",
        "children",
    ]);

    return (
        <div
            class={cn(
                "list",
                local.variant,
                local.size,
                local.orientation,
                local.class,
            )}
            {...others}
        >
            {local.children}
        </div>
    );
}

function ListItem(props: ParentProps<ListItemProps>) {
    const [local, others] = splitProps(props, [
        "disabled",
        "active",
        "class",
        "children",
    ]);

    return (
        <div
            class={cn("list-item", local.class)}
            classList={{ active: local.active, disabled: local.disabled }}
            aria-disabled={local.disabled}
            aria-current={local.active ? "true" : undefined}
            {...others}
        >
            {local.children}
        </div>
    );
}

function ListContent(props: ListContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("list-content", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function ListStart(props: ListStartProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("list-start", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function ListEnd(props: ListEndProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("list-end", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function ListLabel(props: ListLabelProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div
            role="presentation"
            class={cn("list-label", local.class)}
            {...others}
        >
            {local.children}
        </div>
    );
}

function ListTitle(props: ListTitleProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("list-title", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function ListDescription(props: ListDescriptionProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("list-description", local.class)} {...others}>
            {local.children}
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────



export {
    List,
    ListItem,
    ListContent,
    ListStart,
    ListEnd,
    ListLabel,
    ListTitle,
    ListDescription,
};

export type {
    ListProps,
    ListItemProps,
    ListContentProps,
    ListStartProps,
    ListEndProps,
    ListLabelProps,
    ListTitleProps,
    ListDescriptionProps,
    Variant as ListVariant,
    Size as ListSize,
};
