export type {
    FieldProps,
    FieldSectionProps,
    FieldTitleProps,
    FieldDescriptionProps,
    FieldGroupProps,
    FieldHelpProps,
    FieldType,
    FieldSetProps,
} from "./field";

import {
    Field,
    FieldSection,
    FieldTitle,
    FieldDescription,
    FieldGroup,
    FieldHelp,
    FieldSet,
} from "./field";
export {
    Field,
    FieldSection,
    FieldTitle,
    FieldDescription,
    FieldGroup,
    FieldHelp,
    FieldSet,
};

type CompoundField = typeof Field & {
    Section: typeof FieldSection;
    Title: typeof FieldTitle;
    Description: typeof FieldDescription;
    Group: typeof FieldGroup;
    Help: typeof FieldHelp;
};

const FieldCompound = Object.assign(Field, {
    Section: FieldSection,
    Title: FieldTitle,
    Description: FieldDescription,
    Group: FieldGroup,
    Help: FieldHelp,
}) satisfies CompoundField;

export default FieldCompound;
