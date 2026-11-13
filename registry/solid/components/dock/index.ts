export type {
    DockProps,
    DockItemProps,
    DockIconProps,
    DockLabelProps,
} from "./dock";

import { Dock, DockItem, DockIcon, DockLabel } from "./dock";

export { Dock, DockItem, DockIcon, DockLabel };

export default Object.assign(Dock, {
    Item: DockItem,
    Icon: DockIcon,
    Label: DockLabel,
}) satisfies typeof Dock & {
    Item: typeof DockItem;
    Icon: typeof DockIcon;
    Label: typeof DockLabel;
};
