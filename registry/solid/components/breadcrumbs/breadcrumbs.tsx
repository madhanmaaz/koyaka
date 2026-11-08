import { JSX, ParentProps, splitProps } from "solid-js";

import { cn } from "../../helpers/utils";

// ─── Props ────────────────────────────────────────────────────────────────────
interface BreadcrumbsProps extends JSX.HTMLAttributes<HTMLDivElement> {}

interface BreadcrumbsItemProps extends JSX.HTMLAttributes<HTMLDivElement> {}

interface BreadcrumbsButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
    disabled?: boolean;
    active?: boolean;
}

interface BreadcrumbsLinkProps extends JSX.HTMLAttributes<HTMLAnchorElement> {
    active?: boolean;
}

// ─── Components ───────────────────────────────────────────────────────────────
function Breadcrumbs(props: ParentProps<BreadcrumbsProps>) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <nav
            aria-label="Breadcrumb"
            class={cn("breadcrumbs", local.class)}
            {...others}
        >
            {local.children}
        </nav>
    );
}

function BreadcrumbsItem(props: ParentProps<BreadcrumbsItemProps>) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("breadcrumbs-item", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function BreadcrumbsButton(props: BreadcrumbsButtonProps) {
    const [local, others] = splitProps(props, [
        "class",
        "children",
        "disabled",
        "active",
    ]);

    return (
        <button
            class={cn("breadcrumbs-action", local.class)}
            classList={{
                active: local.active,
            }}
            aria-disabled={local.disabled || undefined}
            disabled={local.disabled}
            {...others}
        >
            {local.children}
        </button>
    );
}

function BreadcrumbsLink(props: BreadcrumbsLinkProps) {
    const [local, others] = splitProps(props, ["class", "children", "active"]);

    return (
        <a
            class={cn("breadcrumbs-action", local.class)}
            classList={{
                active: local.active,
            }}
            {...others}
        >
            {local.children}
        </a>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Breadcrumbs, BreadcrumbsItem, BreadcrumbsButton, BreadcrumbsLink };

export type {
    BreadcrumbsProps,
    BreadcrumbsItemProps,
    BreadcrumbsButtonProps,
    BreadcrumbsLinkProps,
};
