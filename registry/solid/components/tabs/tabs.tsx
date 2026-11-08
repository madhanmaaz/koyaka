import {
    createContext,
    createSignal,
    Show,
    useContext,
    splitProps,
    JSX,
} from "solid-js";
import { cn } from "../../helpers/utils";
import type { Placement, Size, Color } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabsVariant = "surface" | "split" | "underline";

// ─── Context ──────────────────────────────────────────────────────────────────

interface TabsContextValue {
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

type TabsListProps = JSX.HTMLAttributes<HTMLDivElement>;

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
        <TabsContext.Provider value={{ active, setActive }}>
            <div
                class={cn(
                    "tabs",
                    local.variant,
                    local.placement,
                    local.size,
                    local.color,
                    local.class,
                )}
                {...others}
            >
                {local.children}
            </div>
        </TabsContext.Provider>
    );
}

function TabsList(props: TabsListProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div role="tablist" class={cn("tabs-list", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function TabsTrigger(props: TabsTriggerProps) {
    const [local, others] = splitProps(props, [
        "value",
        "disabled",

        "class",
        "children",
    ]);

    const { active, setActive } = useTabs();
    const isActive = () => active() === local.value;

    const triggerId = `tabs-trigger-${local.value}`;
    const panelId = `tabs-panel-${local.value}`;

    return (
        <button
            id={triggerId}
            type="button"
            role="tab"
            aria-selected={isActive()}
            aria-controls={panelId}
            disabled={local.disabled}
            class={cn("tabs-trigger", local.class)}
            classList={{ active: isActive() }}
            onClick={() => !local.disabled && setActive(local.value)}
            {...others}
        >
            {local.children}
        </button>
    );
}

function TabsContent(props: TabsContentProps) {
    const [local, others] = splitProps(props, ["value", "class", "children"]);
    const { active } = useTabs();

    const triggerId = `tabs-trigger-${local.value}`;
    const panelId = `tabs-panel-${local.value}`;

    return (
        <Show when={active() === local.value}>
            <div
                id={panelId}
                role="tabpanel"
                tabIndex={0}
                aria-labelledby={triggerId}
                class={cn("tabs-content", local.class)}
                classList={{ active: active() === local.value }}
                {...others}
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
};
