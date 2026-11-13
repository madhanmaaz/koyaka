export type {
    SheetProps,
    SheetRootProps,
    SheetContentProps,
    SheetSize,
    SheetPlacement,
    SheetTriggerProps,
    SheetCloseProps,
    SheetBackdropProps,
    SheetBackdropVariant,
} from "./sheet";

import {
    Sheet,
    SheetRoot,
    SheetContent,
    SheetTrigger,
    SheetClose,
    SheetBackdrop,
} from "./sheet";

export {
    Sheet,
    SheetRoot,
    SheetContent,
    SheetTrigger,
    SheetClose,
    SheetBackdrop,
};

export default Object.assign(Sheet, {
    Root: SheetRoot,
    Content: SheetContent,
    Trigger: SheetTrigger,
    Close: SheetClose,
    Backdrop: SheetBackdrop,
}) satisfies typeof Sheet & {
    Root: typeof SheetRoot;
    Content: typeof SheetContent;
    Trigger: typeof SheetTrigger;
    Close: typeof SheetClose;
    Backdrop: typeof SheetBackdrop;
};
