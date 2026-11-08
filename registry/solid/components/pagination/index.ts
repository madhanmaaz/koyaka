export type {
    PaginationProps,
    PaginationEllipsisProps,
    PaginationListProps,
    UsePaginationProps,
    UsePaginationReturn,
    PageItem,
} from "./pagination";

import {
    Pagination,
    PaginationEllipsis,
    PaginationList,
    usePagination,
} from "./pagination";
export { Pagination, PaginationEllipsis, PaginationList, usePagination };

export default Object.assign(Pagination, {
    Ellipsis: PaginationEllipsis,
    List: PaginationList,
}) satisfies typeof Pagination & {
    Ellipsis: typeof PaginationEllipsis;
    List: typeof PaginationList;
};
