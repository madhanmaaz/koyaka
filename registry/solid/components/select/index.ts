export type {
    SelectProps,
    SelectOptionProps,
    SelectOptionGroupProps,
    SelectVariant,
} from "./select";

import { Select, SelectOption, SelectOptionGroup } from "./select";
export { Select, SelectOption, SelectOptionGroup };

export default Object.assign(Select, {
    Option: SelectOption,
    OptionGroup: SelectOptionGroup,
}) satisfies typeof Select & {
    Option: typeof SelectOption;
    OptionGroup: typeof SelectOptionGroup;
};
