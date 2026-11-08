export type { SliderProps, SliderRangeProps } from "./slider";

import { Slider, SliderRange } from "./slider";

export { Slider, SliderRange };

export default Object.assign(Slider, {
    Range: SliderRange,
}) satisfies typeof Slider & {
    Range: typeof SliderRange;
};
