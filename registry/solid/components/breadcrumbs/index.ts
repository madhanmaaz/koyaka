export type {
    BreadcrumbsProps,
    BreadcrumbsItemProps,
    BreadcrumbsButtonProps,
    BreadcrumbsLinkProps,
} from "./breadcrumbs";

import {
    Breadcrumbs,
    BreadcrumbsItem,
    BreadcrumbsButton,
    BreadcrumbsLink,
} from "./breadcrumbs";
export { Breadcrumbs, BreadcrumbsItem, BreadcrumbsButton, BreadcrumbsLink };

type CompoundBreadcrumbs = typeof Breadcrumbs & {
    Item: typeof BreadcrumbsItem;
    Button: typeof BreadcrumbsButton;
    Link: typeof BreadcrumbsLink;
};

const BreadcrumbsCompound = Object.assign(Breadcrumbs, {
    Item: BreadcrumbsItem,
    Button: BreadcrumbsButton,
    Link: BreadcrumbsLink,
}) satisfies CompoundBreadcrumbs;

export default BreadcrumbsCompound;
