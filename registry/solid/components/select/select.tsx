import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size, Color } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = "soft" | "outline" | "faded";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
    variant?: Variant | Variant[];
    size?: Size;
    color?: Color;
}

interface SelectOptionProps extends JSX.OptionHTMLAttributes<HTMLOptionElement> {}
interface SelectOptionGroupProps extends JSX.OptgroupHTMLAttributes<HTMLOptGroupElement> {}

// ─── Components ───────────────────────────────────────────────────────────────

function Select(props: SelectProps) {
    const [local, others] = splitProps(props, [
        "variant",
        "size",
        "color",
        "class",
        "children",
    ]);

    return (
        <select
            class={cn(
                "select",
                local.variant,
                local.size,
                local.color,
                local.class,
            )}
            {...others}
        >
            {local.children}
        </select>
    );
}

function SelectOption(props: SelectOptionProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <option class={cn("select-option", local.class)} {...others}>
            {local.children}
        </option>
    );
}

function SelectOptionGroup(props: SelectOptionGroupProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <optgroup class={cn("select-option-group", local.class)} {...others}>
            {local.children}
        </optgroup>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Select, SelectOption, SelectOptionGroup };

export type {
    SelectProps,
    SelectOptionProps,
    SelectOptionGroupProps,
    Variant as SelectVariant,
};
