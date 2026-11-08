import {
    createMemo,
    createSignal,
    JSX,
    ParentProps,
    splitProps,
} from "solid-js";
import { cn } from "../../helpers/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type PageItem =
    | { type: "page"; value: number; isActive: boolean }
    | { type: "ellipsis"; value: "start" | "end" };

interface UsePaginationProps extends JSX.HTMLAttributes<HTMLDivElement> {
    count: number;
    pageSize?: number;
    page?: () => number;
    siblingCount?: number;
    onPageChange?: (page: number) => void;
}

interface UsePaginationReturn {
    page: () => number;
    totalPages: () => number;
    pages: () => PageItem[];
    isFirst: () => boolean;
    isLast: () => boolean;
    goTo: (page: number) => void;
    pageNext: () => void;
    pagePrev: () => void;
}

interface PaginationProps extends JSX.HTMLAttributes<HTMLElement> {}
interface PaginationListProps extends JSX.HTMLAttributes<HTMLDivElement> {}
interface PaginationEllipsisProps extends JSX.HTMLAttributes<HTMLSpanElement> {}

// ─── Page range logic ─────────────────────────────────────────────────────────

function buildPages(
    page: number,
    totalPages: number,
    siblingCount: number,
): PageItem[] {
    const pages: PageItem[] = [];

    const left = Math.max(2, page - siblingCount);
    const right = Math.min(totalPages - 1, page + siblingCount);

    pages.push({ type: "page", value: 1, isActive: page === 1 });

    if (left > 2) {
        pages.push({ type: "ellipsis", value: "start" });
    }

    for (let i = left; i <= right; i++) {
        pages.push({ type: "page", value: i, isActive: page === i });
    }

    if (right < totalPages - 1) {
        pages.push({ type: "ellipsis", value: "end" });
    }

    if (totalPages > 1) {
        pages.push({
            type: "page",
            value: totalPages,
            isActive: page === totalPages,
        });
    }

    return pages;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function usePagination(props: UsePaginationProps): UsePaginationReturn {
    const isControlled = () => props.page !== undefined;
    const pageSize = () => props.pageSize ?? 10;
    const siblingCount = () => props.siblingCount ?? 1;

    const [uncontrolled, setUncontrolled] = createSignal(1);
    const page = () => (isControlled() ? props.page!() : uncontrolled());
    const totalPages = createMemo(() =>
        Math.max(1, Math.ceil(props.count / pageSize())),
    );
    const pages = createMemo(() =>
        buildPages(page(), totalPages(), siblingCount()),
    );
    const isFirst = () => page() <= 1;
    const isLast = () => page() >= totalPages();

    function goTo(p: number) {
        const clamped = Math.min(Math.max(1, p), totalPages());
        if (!isControlled()) setUncontrolled(clamped);
        props.onPageChange?.(clamped);
    }

    return {
        page,
        totalPages,
        pages,
        isFirst,
        isLast,
        goTo,
        pageNext: () => goTo(page() + 1),
        pagePrev: () => goTo(page() - 1),
    };
}

// ─── Components ───────────────────────────────────────────────────────────────

function Pagination(props: ParentProps<PaginationProps>) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <nav
            class={cn("pagination", local.class)}
            aria-label="Pagination"
            {...others}
        >
            {local.children}
        </nav>
    );
}

function PaginationList(props: PaginationListProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div class={cn("pagination-list", local.class)} {...others}>
            {local.children}
        </div>
    );
}

function PaginationEllipsis(props: PaginationEllipsisProps) {
    const [local, others] = splitProps(props, ["class"]);

    return (
        <span
            class={cn("pagination-ellipsis", local.class)}
            aria-hidden="true"
            {...others}
        />
    );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { Pagination, PaginationEllipsis, PaginationList, usePagination };

export type {
    PaginationProps,
    PaginationEllipsisProps,
    PaginationListProps,
    UsePaginationProps,
    UsePaginationReturn,
    PageItem,
};
