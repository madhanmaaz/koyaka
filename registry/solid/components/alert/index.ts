export type {
    AlertProps,
    AlertContentProps,
    AlertTitleProps,
    AlertDescriptionProps,
    AlertVariant,
    AlertColor,
} from "./alert";

import { Alert, AlertContent, AlertTitle, AlertDescription } from "./alert";
export { Alert, AlertContent, AlertTitle, AlertDescription };

type CompoundAlert = typeof Alert & {
    Content: typeof AlertContent;
    Title: typeof AlertTitle;
    Description: typeof AlertDescription;
};

const AlertCompound = Object.assign(Alert, {
    Content: AlertContent,
    Title: AlertTitle,
    Description: AlertDescription,
}) satisfies CompoundAlert;

export default AlertCompound;
