export type {
    ListProps,
    ListItemProps,
    ListContentProps,
    ListStartProps,
    ListEndProps,
    ListLabelProps,
    ListTitleProps,
    ListDescriptionProps,
    ListVariant,
    ListSize,
} from "./list";

import {
    List,
    ListItem,
    ListContent,
    ListStart,
    ListEnd,
    ListLabel,
    ListTitle,
    ListDescription,
} from "./list";

export {
    List,
    ListItem,
    ListContent,
    ListStart,
    ListEnd,
    ListLabel,
    ListTitle,
    ListDescription,
};

type CompoundList = typeof List & {
    Item: typeof ListItem;
    Content: typeof ListContent;
    Start: typeof ListStart;
    End: typeof ListEnd;
    Label: typeof ListLabel;
    Title: typeof ListTitle;
    Description: typeof ListDescription;
};

const ListCompound = Object.assign(List, {
    Item: ListItem,
    Content: ListContent,
    Start: ListStart,
    End: ListEnd,
    Label: ListLabel,
    Title: ListTitle,
    Description: ListDescription,
}) satisfies CompoundList;

export default ListCompound;
