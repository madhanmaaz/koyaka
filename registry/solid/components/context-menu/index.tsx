export type {
    ContextMenuProps,
    ContextMenuTriggerProps,
    ContextMenuContentProps,
} from "./context-menu";

import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
} from "./context-menu";

export { ContextMenu, ContextMenuTrigger, ContextMenuContent };

export default Object.assign(ContextMenu, {
    Trigger: ContextMenuTrigger,
    Content: ContextMenuContent,
}) satisfies typeof ContextMenu & {
    Trigger: typeof ContextMenuTrigger;
    Content: typeof ContextMenuContent;
};
