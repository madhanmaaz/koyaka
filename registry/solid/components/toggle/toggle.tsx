import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

import type { ButtonVariant } from "../button";

import { cn } from "../../helpers/utils";
import type { Color, SizeVariant } from "../../helpers/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ToggleProps extends Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "onChange"
> {
    type?: "checkbox" | "radio";
    variant?: ButtonVariant;
    size?: SizeVariant;
    color?: Color;
    disabled?: boolean;
    loading?: boolean;

    // form
    name?: string;
    value?: string;

    // controlled (checked) or uncontrolled (defaultChecked)
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean, event: Event) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Toggle(props: ToggleProps) {
    const [local, others] = splitProps(props, [
        "type",
        "variant",
        "size",
        "color",
        "disabled",
        "loading",

        "name",
        "value",
        "checked",
        "defaultChecked",
        "onChange",
        "aria-label", // names the input, which a label's aria-label wouldn't

        "class",
        "children",
    ]);

    const isControlled = () => local.checked !== undefined;
    const isDisabled = () => Boolean(local.disabled || local.loading);

    return (
        <div
            {...others}
            class={cn("toggle")}
            aria-busy={local.loading || undefined}
        >
            <input
                type={local.type ?? "checkbox"}
                name={local.name}
                value={local.value || ""}
                checked={isControlled() ? local.checked : local.defaultChecked}
                disabled={isDisabled()}
                aria-label={local["aria-label"]}
                onChange={(event) =>
                    local.onChange?.(event.currentTarget.checked, event)
                }
            />
            <span
                class={cn(
                    "btn",
                    local.class,
                    local.variant,
                    local.size,
                    local.color,
                    local.loading && "loading",
                    local.disabled && "disabled",
                )}
            >
                {local.children}
            </span>
        </div>
    );
}

export { Toggle };

export type { ToggleProps, ButtonVariant as ToggleVariant };
