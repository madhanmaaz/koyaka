export type {
    TooltipProps,
    TooltipTriggerProps,
    TooltipContentProps,
} from "./tooltip";

import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";

export { Tooltip, TooltipTrigger, TooltipContent };

export default Object.assign(Tooltip, {
    Trigger: TooltipTrigger,
    Content: TooltipContent,
}) satisfies typeof Tooltip & {
    Trigger: typeof TooltipTrigger;
    Content: typeof TooltipContent;
};
