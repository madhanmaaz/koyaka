export type {
    IndicatorProps,
    IndicatorItemProps,
    IndicatorPlacement,
    IndicatorAlign,
} from "./indicator";

import { Indicator, IndicatorItem } from "./indicator";
export { Indicator, IndicatorItem };

type CompoundIndicator = typeof Indicator & {
    Item: typeof IndicatorItem;
};

const IndicatorCompound = Object.assign(Indicator, {
    Item: IndicatorItem,
}) satisfies CompoundIndicator;

export default IndicatorCompound;
