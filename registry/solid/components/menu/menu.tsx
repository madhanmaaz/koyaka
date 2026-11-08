import { splitProps, JSX } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";
import {
    MenuPopover,
    MenuPopoverTrigger,
    MenuPopoverContent,
} from "./menu-popover";
import type {
    MenuPopoverProps,
    MenuPopoverTriggerProps,
    MenuPopoverContentProps,
} from "./menu-popover";

// ─── Types ────────────────────────────────────────────────────────────────────
type MenuVariant = "surface";
type MenuItemVariant = "soft" | "outline" | "faded" | "danger";

interface MenuActionDetail {
    element: HTMLElement;
    value?: string;
}

interface MenuProps extends Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "onChange"
> {
    variant?: MenuVariant;
    size?: Size;
    color?: Color;
    onAction?: (detail: MenuActionDetail) => void;
}

interface MenuItemProps {
    checked?: boolean;
    active?: boolean;
    disabled?: boolean;
    keepOpen?: boolean;
    variant?: MenuItemVariant;
    value?: string;
}

interface MenuButtonProps
    extends JSX.ButtonHTMLAttributes<HTMLButtonElement>, MenuItemProps {}

interface MenuLinkProps
    extends JSX.AnchorHTMLAttributes<HTMLAnchorElement>, MenuItemProps {}

interface MenuLabelProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface MenuSeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface MenuStartProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface MenuContentProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface MenuTitleProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface MenuDescriptionProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface MenuEndProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface MenuTreeProps extends JSX.HTMLAttributes<HTMLDivElement> {}

type MenuCollapsibleProps = JSX.DetailsHtmlAttributes<HTMLDetailsElement>;
type MenuCollapsibleTriggerProps = JSX.HTMLAttributes<HTMLElement>;
type MenuCollapsibleContentProps = JSX.HTMLAttributes<HTMLDivElement>;

// not actions: disabled items and items that only open or close something
const NON_ACTION = ':disabled, .disabled, [aria-disabled="true"]';

// ─── Menu ─────────────────────────────────────────────────────────────────────
function Menu(props: MenuProps) {
    const [local, others] = splitProps(props, [
        "variant",
        "size",
        "color",
        "onAction",
        "onClick",

        "class",
        "children",
    ]);

    const handleClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
        // keep the user's own onClick working (function or [handler, data])
        const userOnClick = local.onClick;
        if (typeof userOnClick === "function") {
            userOnClick(e);
        } else if (userOnClick) {
            userOnClick[0](userOnClick[1], e);
        }

        const action = e.target.closest<HTMLElement>(".menu-action");
        if (!action || action.matches(NON_ACTION)) return;

        local.onAction?.({
            element: action,
            value: action.dataset.value,
        });
    };

    return (
        <div
            role="menu"
            {...others}
            class={cn(
                "menu",
                local.variant,
                local.size,
                local.color,
                local.class,
            )}
            onClick={handleClick}
        >
            {local.children}
        </div>
    );
}

// ─── Items ────────────────────────────────────────────────────────────────────
function itemRole(checked: boolean | undefined) {
    return checked === undefined ? "menuitem" : "menuitemcheckbox";
}

function MenuButton(props: MenuButtonProps) {
    const [local, others] = splitProps(props, [
        "active",
        "disabled",
        "keepOpen",
        "checked",
        "variant",
        "value",

        "class",
        "children",
    ]);

    return (
        <button
            type="button"
            role={itemRole(local.checked)}
            {...others}
            class={cn(
                "menu-action",
                local.variant,
                local.active && "active",
                local.checked && "checked",
                local.disabled && "disabled",
                local.class,
            )}
            disabled={local.disabled}
            aria-checked={local.checked}
            data-keep-open={local.keepOpen || undefined}
            data-value={local.value}
        >
            {local.children}
        </button>
    );
}

function MenuLink(props: MenuLinkProps) {
    const [local, others] = splitProps(props, [
        "active",
        "disabled",
        "keepOpen",
        "checked",
        "href",
        "variant",
        "value",

        "class",
        "children",
    ]);

    return (
        <a
            role={itemRole(local.checked)}
            {...others}
            class={cn(
                "menu-action",
                local.variant,
                local.active && "active",
                local.checked && "checked",
                local.disabled && "disabled",
                local.class,
            )}
            // an anchor without href isn't focusable or navigable, which disables it
            href={local.disabled ? undefined : local.href}
            aria-disabled={local.disabled || undefined}
            aria-checked={local.checked}
            data-keep-open={local.keepOpen || undefined}
            data-value={local.value}
        >
            {local.children}
        </a>
    );
}

function MenuLabel(props: MenuLabelProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div
            role="presentation"
            class={cn("menu-label", local.class)}
            {...others}
        >
            {local.children}
        </div>
    );
}

function MenuSeparator(props: MenuSeparatorProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div
            role="separator"
            class={cn("menu-separator", local.class)}
            {...others}
        >
            {local.children}
        </div>
    );
}

function MenuStart(props: MenuStartProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("menu-start", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function MenuContent(props: MenuContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("menu-content", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function MenuTitle(props: MenuTitleProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("menu-title", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function MenuDescription(props: MenuDescriptionProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("menu-description", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function MenuEnd(props: MenuEndProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div {...others} class={cn("menu-end", local.class)}>
            {local.children}
        </div>
    );
}

function MenuTree(props: MenuTreeProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div {...others} class={cn("menu-tree", local.class)}>
            {local.children}
        </div>
    );
}

// ─── Collapsible ──────────────────────────────────────────────────────────────
function MenuCollapsible(props: MenuCollapsibleProps) {
    const [local, others] = splitProps(props, ["open", "class", "children"]);

    return (
        <details
            {...others}
            class={cn("menu-collapsible", local.class)}
            open={local.open}
        >
            {local.children}
        </details>
    );
}

function MenuCollapsibleTrigger(props: MenuCollapsibleTriggerProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <summary
            {...others}
            class={cn("menu-collapsible-trigger menu-action", local.class)}
        >
            {local.children}
        </summary>
    );
}

function MenuCollapsibleContent(props: MenuCollapsibleContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div
            {...others}
            class={cn("menu-tree menu-collapsible-content", local.class)}
        >
            {local.children}
        </div>
    );
}

export {
    Menu,
    MenuButton,
    MenuLink,
    MenuLabel,
    MenuStart,
    MenuContent,
    MenuTitle,
    MenuDescription,
    MenuEnd,
    MenuSeparator,
    MenuTree,
    MenuCollapsible,
    MenuCollapsibleTrigger,
    MenuCollapsibleContent,
    MenuPopover,
    MenuPopoverTrigger,
    MenuPopoverContent,
};

export type {
    MenuProps,
    MenuItemProps,
    MenuButtonProps,
    MenuLinkProps,
    MenuLabelProps,
    MenuStartProps,
    MenuContentProps,
    MenuTitleProps,
    MenuDescriptionProps,
    MenuEndProps,
    MenuSeparatorProps,
    MenuTreeProps,
    MenuCollapsibleProps,
    MenuCollapsibleTriggerProps,
    MenuCollapsibleContentProps,
    MenuPopoverProps,
    MenuPopoverTriggerProps,
    MenuPopoverContentProps,
    MenuVariant,
    MenuItemVariant,
};
