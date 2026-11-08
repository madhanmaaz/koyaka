import {
    createContext,
    createSignal,
    useContext,
    splitProps,
    createUniqueId,
    JSX,
} from "solid-js";

import { cn } from "../../helpers/utils";
import type { Size } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────
type AccordionType = "single" | "multiple";
type Variant = "surface" | "split";
type Icon = "icon-chevron" | "icon-disclosure" | "icon-plus";
type IconPlacement = "icon-start" | "icon-end";

// ─── Context ──────────────────────────────────────────────────────────────────
interface AccordionContextValue {
    active: () => string[];
    toggle: (itemValue: string) => void;
    disabled: () => boolean;
}

interface AccordionItemContextValue {
    value: string;
    uid: string;
    isActive: () => boolean;
    disabled: () => boolean;
}

const AccordionContext = createContext<AccordionContextValue>();
const AccordionItemContext = createContext<AccordionItemContextValue>();

function useAccordion(): AccordionContextValue {
    const ctx = useContext(AccordionContext);
    if (!ctx) {
        throw new Error("<Accordion.*> must be used inside <Accordion>");
    }
    return ctx;
}

function useAccordionItem(): AccordionItemContextValue {
    const ctx = useContext(AccordionItemContext);
    if (!ctx) {
        throw new Error(
            "<Accordion.Trigger|Content> must be used inside <Accordion.Item>",
        );
    }
    return ctx;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface AccordionProps extends JSX.HTMLAttributes<HTMLDivElement> {
    type?: AccordionType;
    variant?: Variant;
    icon?: Icon;
    iconPlacement?: IconPlacement;
    size?: Size;

    defaultValue?: string[];
    value?: string[];
    onValueChange?: (value: string[]) => void;

    disabled?: boolean;
}

interface AccordionItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
    value: string;
    disabled?: boolean;
}

interface AccordionTriggerProps extends JSX.HTMLAttributes<HTMLButtonElement> {}
interface AccordionContentProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function toggleSingle(current: string[], itemValue: string): string[] {
    return current.includes(itemValue) ? [] : [itemValue];
}

function toggleMultiple(current: string[], itemValue: string): string[] {
    return current.includes(itemValue)
        ? current.filter((v) => v !== itemValue)
        : [...current, itemValue];
}

// ─── Components ────────────────────────────────────────────────────────────────

function Accordion(props: AccordionProps) {
    const [local, others] = splitProps(props, [
        "type",
        "variant",
        "icon",
        "iconPlacement",
        "size",

        "defaultValue",
        "value",
        "onValueChange",

        "disabled",

        "class",
        "children",
    ]);

    const [internalActive, setInternalActive] = createSignal<string[]>(
        local.defaultValue ?? [],
    );

    const isControlled = () => local.value !== undefined;
    const type = () => local.type ?? "multiple";
    const active = () => (isControlled() ? local.value! : internalActive());

    function setActive(next: string[]) {
        if (!isControlled()) {
            setInternalActive(next);
        }

        local.onValueChange?.(next);
    }

    function toggle(itemValue: string) {
        const next =
            type() === "single"
                ? toggleSingle(active(), itemValue)
                : toggleMultiple(active(), itemValue);

        setActive(next);
    }
    return (
        <AccordionContext.Provider
            value={{
                active,
                toggle,
                disabled: () => local.disabled ?? false,
            }}
        >
            <div
                class={cn(
                    "accordion",
                    local.variant,
                    local.icon,
                    local.iconPlacement,
                    local.size,
                    local.class,
                )}
                {...others}
            >
                {local.children}
            </div>
        </AccordionContext.Provider>
    );
}

function AccordionItem(props: AccordionItemProps) {
    const [local, others] = splitProps(props, [
        "value",

        "disabled",

        "class",
        "children",
    ]);

    const { active, disabled: accordionDisabled } = useAccordion();
    const uid = createUniqueId();
    const isActive = () => active().includes(local.value);
    const disabled = () => accordionDisabled() || (local.disabled ?? false);

    return (
        <AccordionItemContext.Provider
            value={{
                value: local.value,
                uid,
                isActive,
                disabled,
            }}
        >
            <div
                class={cn("accordion-item", local.class)}
                classList={{ active: isActive(), disabled: disabled() }}
                aria-disabled={disabled() || undefined}
                {...others}
            >
                {local.children}
            </div>
        </AccordionItemContext.Provider>
    );
}

function AccordionTrigger(props: AccordionTriggerProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    const { toggle } = useAccordion();
    const { value, uid, isActive, disabled } = useAccordionItem();

    const triggerId = `accordion-trigger-${uid}`;
    const panelId = `accordion-panel-${uid}`;

    return (
        <button
            id={triggerId}
            class={cn("accordion-trigger", local.class)}
            classList={{ disabled: disabled() }}
            onClick={() => !disabled() && toggle(value)}
            aria-expanded={isActive()}
            aria-controls={panelId}
            disabled={disabled()}
            type="button"
            {...others}
        >
            {local.children}
        </button>
    );
}

function AccordionContent(props: AccordionContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    const { uid, isActive } = useAccordionItem();

    const triggerId = `accordion-trigger-${uid}`;
    const panelId = `accordion-panel-${uid}`;

    return (
        <div
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            class={cn("accordion-content", local.class)}
            aria-hidden={!isActive()}
            {...others}
        >
            <div class="accordion-body">{local.children}</div>
        </div>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

export type {
    AccordionProps,
    AccordionItemProps,
    AccordionTriggerProps,
    AccordionContentProps,
};
