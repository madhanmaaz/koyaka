export type {
    MenuProps,
    MenuItemProps,
    MenuButtonProps,
    MenuLinkProps,
    MenuLabelProps,
    MenuStartProps,
    MenuContentProps,
    MenuTitleProps,
    MenuDescriptionProps,
    MenuEndProps,
    MenuSeparatorProps,
    MenuTreeProps,
    MenuCollapsibleProps,
    MenuCollapsibleTriggerProps,
    MenuCollapsibleContentProps,
    MenuPopoverProps,
    MenuPopoverTriggerProps,
    MenuPopoverContentProps,
    MenuVariant,
    MenuItemVariant,
} from "./menu";

import {
    Menu,
    MenuButton,
    MenuLink,
    MenuLabel,
    MenuStart,
    MenuContent,
    MenuTitle,
    MenuDescription,
    MenuEnd,
    MenuSeparator,
    MenuTree,
    MenuCollapsible,
    MenuCollapsibleTrigger,
    MenuCollapsibleContent,
    MenuPopover,
    MenuPopoverTrigger,
    MenuPopoverContent,
} from "./menu";

export {
    Menu,
    MenuButton,
    MenuLink,
    MenuLabel,
    MenuStart,
    MenuContent,
    MenuTitle,
    MenuDescription,
    MenuEnd,
    MenuSeparator,
    MenuTree,
    MenuCollapsible,
    MenuCollapsibleTrigger,
    MenuCollapsibleContent,
    MenuPopover,
    MenuPopoverTrigger,
    MenuPopoverContent,
};

export default Object.assign(Menu, {
    Button: MenuButton,
    Link: MenuLink,
    Label: MenuLabel,
    Start: MenuStart,
    Content: MenuContent,
    Title: MenuTitle,
    Description: MenuDescription,
    End: MenuEnd,
    Separator: MenuSeparator,
    Tree: MenuTree,
    Collapsible: MenuCollapsible,
    CollapsibleTrigger: MenuCollapsibleTrigger,
    CollapsibleContent: MenuCollapsibleContent,
    Popover: MenuPopover,
    PopoverTrigger: MenuPopoverTrigger,
    PopoverContent: MenuPopoverContent,
}) satisfies typeof Menu & {
    Button: typeof MenuButton;
    Link: typeof MenuLink;
    Label: typeof MenuLabel;
    Start: typeof MenuStart;
    Content: typeof MenuContent;
    Title: typeof MenuTitle;
    Description: typeof MenuDescription;
    End: typeof MenuEnd;
    Separator: typeof MenuSeparator;
    Tree: typeof MenuTree;
    Collapsible: typeof MenuCollapsible;
    CollapsibleTrigger: typeof MenuCollapsibleTrigger;
    CollapsibleContent: typeof MenuCollapsibleContent;
    Popover: typeof MenuPopover;
    PopoverTrigger: typeof MenuPopoverTrigger;
    PopoverContent: typeof MenuPopoverContent;
};
