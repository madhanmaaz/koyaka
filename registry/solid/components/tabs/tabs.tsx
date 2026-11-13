import {
    createContext,
    createSignal,
    createUniqueId,
    Show,
    useContext,
    splitProps,
} from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Placement, Size, Color } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabsVariant = "surface" | "split";
type TabsListVariant = "underline";

// ─── Context ──────────────────────────────────────────────────────────────────

interface TabsContextValue {
    /** Unique per <Tabs>, so ids don't clash when a page has several. */
    id: string;
    active: () => string;
    setActive: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue>();

function useTabs(): TabsContextValue {
    const ctx = useContext(TabsContext);
    if (!ctx) {
        throw new Error("<Tabs.*> must be used inside <Tabs>");
    }
    return ctx;
}

// keeps the user's own handler working (function or [handler, data])
function callHandler<E extends Event>(handler: unknown, e: E) {
    if (typeof handler === "function") {
        handler(e);
    } else if (Array.isArray(handler)) {
        handler[0](handler[1], e);
    }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TabsProps extends JSX.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;

    variant?: TabsVariant;
    placement?: Placement;
    size?: Size;
    color?: Color;
}

interface TabsListProps extends JSX.HTMLAttributes<HTMLDivElement> {
    variant?: TabsListVariant;
    /** Let the triggers wrap onto several lines. */
    multiline?: boolean;
    /** Triggers share the width of the list equally. */
    fill?: boolean;
}

interface TabsTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

interface TabsContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
    value: string;
}

// ─── Components ───────────────────────────────────────────────────────────────

function Tabs(props: TabsProps) {
    const [local, others] = splitProps(props, [
        "defaultValue",
        "value",
        "onValueChange",

        "variant",
        "placement",
        "size",
        "color",

        "class",
        "children",
    ]);

    const id = createUniqueId();

    const isControlled = () => local.value !== undefined;
    const [internalActive, setInternalActive] = createSignal(
        local.defaultValue ?? "",
    );
    const active = () => (isControlled() ? local.value! : internalActive());

    function setActive(value: string) {
        if (!isControlled()) {
            setInternalActive(value);
        }
        local.onValueChange?.(value);
    }

    return (
        <TabsContext.Provider value={{ id, active, setActive }}>
            <div
                {...others}
                class={cn(
                    "tabs",
                    local.variant,
                    local.placement,
                    local.size,
                    local.color,
                    local.class,
                )}
            >
                {local.children}
            </div>
        </TabsContext.Provider>
    );
}

function TabsList(props: TabsListProps) {
    const [local, others] = splitProps(props, [
        "variant",
        "multiline",
        "fill",

        "class",
        "children",
    ]);

    return (
        <div
            role="tablist"
            {...others}
            class={cn(
                "tabs-list",
                local.variant,
                local.multiline ? "multiline" : undefined,
                local.fill ? "fill" : undefined,
                local.class,
            )}
        >
            {local.children}
        </div>
    );
}

function TabsTrigger(props: TabsTriggerProps) {
    const [local, others] = splitProps(props, [
        "value",
        "disabled",
        "onClick",

        "class",
        "children",
    ]);

    const { id, active, setActive } = useTabs();
    const isActive = () => active() === local.value;

    const triggerId = () => `${id}-trigger-${local.value}`;
    const panelId = () => `${id}-panel-${local.value}`;

    return (
        <button
            type="button"
            {...others}
            id={triggerId()}
            role="tab"
            aria-selected={isActive()}
            aria-controls={panelId()}
            disabled={local.disabled}
            class={cn(
                "tabs-trigger",
                isActive() ? "active" : undefined,
                local.class,
            )}
            onClick={(e) => {
                callHandler(local.onClick, e);
                if (!e.defaultPrevented && !local.disabled) {
                    setActive(local.value);
                }
            }}
        >
            {local.children}
        </button>
    );
}

function TabsContent(props: TabsContentProps) {
    const [local, others] = splitProps(props, ["value", "class", "children"]);
    const { id, active } = useTabs();

    const triggerId = () => `${id}-trigger-${local.value}`;
    const panelId = () => `${id}-panel-${local.value}`;

    return (
        <Show when={active() === local.value}>
            <div
                tabIndex={0}
                {...others}
                id={panelId()}
                role="tabpanel"
                aria-labelledby={triggerId()}
                class={cn("tabs-content", "active", local.class)}
            >
                {local.children}
            </div>
        </Show>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Tabs, TabsList, TabsTrigger, TabsContent, useTabs };

export type {
    TabsProps,
    TabsListProps,
    TabsTriggerProps,
    TabsContentProps,
    TabsVariant,
    TabsListVariant,
};
