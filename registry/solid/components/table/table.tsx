import { JSX, splitProps } from "solid-js";
import { cn } from "../../helpers/utils";
import type { Size } from "../../helpers/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type TableVariant = "stripe" | "outline";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TableProps extends JSX.HTMLAttributes<HTMLDivElement> {
    size?: Size;
    variant?: TableVariant;
    hoverable?: boolean;
}

type TheadProps = JSX.HTMLAttributes<HTMLTableSectionElement>;
type TbodyProps = JSX.HTMLAttributes<HTMLTableSectionElement>;
type TrProps = JSX.HTMLAttributes<HTMLTableRowElement>;
type TdProps = JSX.TdHTMLAttributes<HTMLTableCellElement>;
type ThProps = JSX.ThHTMLAttributes<HTMLTableCellElement>;

// ─── Components ───────────────────────────────────────────────────────────────

function Table(props: TableProps) {
    const [local, others] = splitProps(props, [
        "size",
        "variant",
        "hoverable",

        "class",
        "children",
    ]);

    return (
        <div
            {...others}
            class={cn(
                "table",
                local.size,
                local.variant,
                local.hoverable && "hoverable",
                local.class,
            )}
        >
            <table>{local.children}</table>
        </div>
    );
}

function Thead(props: TheadProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <thead {...others} class={cn("table-head", local.class)}>
            {local.children}
        </thead>
    );
}

function Tbody(props: TbodyProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <tbody {...others} class={cn("table-body", local.class)}>
            {local.children}
        </tbody>
    );
}

function Tr(props: TrProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <tr {...others} class={cn("table-row", local.class)}>
            {local.children}
        </tr>
    );
}

function Td(props: TdProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <td {...others} class={cn("table-cell", local.class)}>
            {local.children}
        </td>
    );
}

function Th(props: ThProps) {
    const [local, others] = splitProps(props, ["class", "children", "scope"]);

    return (
        <th
            {...others}
            scope={local.scope ?? "col"}
            class={cn("table-header-cell", local.class)}
        >
            {local.children}
        </th>
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Table, Thead, Tbody, Tr, Td, Th };

export type {
    TableProps,
    TheadProps,
    TbodyProps,
    TrProps,
    TdProps,
    ThProps,
    TableVariant,
};
