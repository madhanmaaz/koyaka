export type {
    PopoverProps,
    PopoverTriggerProps,
    PopoverContentProps,
} from "./popover";

import { Popover, PopoverTrigger, PopoverContent } from "./popover";
export { Popover, PopoverTrigger, PopoverContent };

export default Object.assign(Popover, {
    Trigger: PopoverTrigger,
    Content: PopoverContent,
}) satisfies typeof Popover & {
    Trigger: typeof PopoverTrigger;
    Content: typeof PopoverContent;
};
