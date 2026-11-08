export type {
    AccordionProps,
    AccordionItemProps,
    AccordionTriggerProps,
    AccordionContentProps,
} from "./accordion";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./accordion";
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };

export default Object.assign(Accordion, {
    Item: AccordionItem,
    Trigger: AccordionTrigger,
    Content: AccordionContent,
}) satisfies typeof Accordion & {
    Item: typeof AccordionItem;
    Trigger: typeof AccordionTrigger;
    Content: typeof AccordionContent;
};
