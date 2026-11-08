export type {
    LabelProps,
    LabelContentProps,
    LabelTitleProps,
    LabelDescriptionProps,
    LabelVariant,
} from "./label";

import { Label, LabelContent, LabelTitle, LabelDescription } from "./label";
export { Label, LabelContent, LabelTitle, LabelDescription };

type CompoundLabel = typeof Label & {
    Content: typeof LabelContent;
    Title: typeof LabelTitle;
    Description: typeof LabelDescription;
};

const LabelCompound = Object.assign(Label, {
    Content: LabelContent,
    Title: LabelTitle,
    Description: LabelDescription,
}) satisfies CompoundLabel;

export default LabelCompound;
