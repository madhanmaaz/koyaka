import {
    createEffect,
    createSignal,
    JSX,
    onMount,
    Show,
    splitProps,
} from "solid-js";
import { cn } from "../../helpers/utils";
import type { Color, Size } from "../../helpers/types";

interface SliderProps extends JSX.HTMLAttributes<HTMLInputElement> {
    size?: Size;
    color?: Color;
}

interface SliderRangeProps extends Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "onChange"
> {
    min?: number;
    max?: number;
    value?: number;
    minValue?: number;
    maxValue?: number;
    range?: boolean;
    steps?: boolean;
    onChange?: (value: number | [number, number]) => void;

    size?: Size;
    color?: Color;
}

function Slider(props: SliderProps) {
    const [local, others] = splitProps(props, ["size", "color", "class"]);

    return (
        <input
            type="range"
            class={cn("slider", local.class, local.size, local.color)}
            {...others}
        />
    );
}

function SliderRange(props: SliderRangeProps) {
    const [local, others] = splitProps(props, [
        "min",
        "max",
        "value",
        "minValue",
        "maxValue",
        "range",
        "steps",
        "onChange",

        "size",
        "color",

        "class",
    ]);

    const min = () => local.min ?? 0;
    const max = () => local.max ?? 100;
    const isRange = () =>
        local.range ??
        (local.minValue !== undefined && local.maxValue !== undefined);

    const [fromVal, setFromVal] = createSignal(
        local.minValue ?? local.value ?? min(),
    );
    const [toVal, setToVal] = createSignal(local.maxValue ?? max());

    let sliderRef: HTMLDivElement | undefined;
    let dragging: "from" | "to" | null = null;

    const pctToVal = (pct: number) => Math.round(min() + pct * (max() - min()));

    const render = () => {
        if (!sliderRef) return;

        const loPct = ((fromVal() - min()) / (max() - min())) * 100;
        const hiPct = ((toVal() - min()) / (max() - min())) * 100;

        const fill = sliderRef.querySelector(".slider-fill") as HTMLDivElement;
        const thumbFrom = sliderRef.querySelector(
            '[data-thumb="from"]',
        ) as HTMLDivElement;
        const thumbTo = sliderRef.querySelector(
            '[data-thumb="to"]',
        ) as HTMLDivElement;

        if (thumbFrom) thumbFrom.style.left = `${loPct}%`;

        if (isRange()) {
            if (thumbTo) thumbTo.style.left = `${hiPct}%`;
            if (fill) {
                fill.style.left = `${loPct}%`;
                fill.style.width = `${hiPct - loPct}%`;
            }
            local.onChange?.([fromVal(), toVal()]);
        } else {
            if (fill) {
                fill.style.left = "0%";
                fill.style.width = `${loPct}%`;
            }
            local.onChange?.(fromVal());
        }
    };

    const getVal = (e: PointerEvent): number => {
        if (!sliderRef) return 0;
        const rect = sliderRef.getBoundingClientRect();
        const pct = Math.max(
            0,
            Math.min(1, (e.clientX - rect.left) / rect.width),
        );
        return pctToVal(pct);
    };

    const getNearestThumb = (val: number): "from" | "to" => {
        if (!isRange()) return "from";

        const d1 = Math.abs(val - fromVal());
        const d2 = Math.abs(val - toVal());

        if (d1 === d2) {
            return val < (min() + max()) / 2 ? "from" : "to";
        }
        return d1 < d2 ? "from" : "to";
    };

    // Pointer Handlers
    const onPointerDown = (e: PointerEvent) => {
        if (!sliderRef) return;
        e.preventDefault();
        sliderRef.setPointerCapture(e.pointerId);

        const val = getVal(e);
        const target = e.target as HTMLElement;

        if (target.dataset.thumb === "from") dragging = "from";
        else if (target.dataset.thumb === "to") dragging = "to";
        else dragging = getNearestThumb(val);

        if (dragging === "from") {
            setFromVal(isRange() ? Math.min(val, toVal()) : val);
        } else {
            setToVal(Math.max(val, fromVal()));
        }

        render();
    };

    const onPointerMove = (e: PointerEvent) => {
        if (!dragging || !sliderRef) return;

        const val = getVal(e);

        if (dragging === "from") {
            setFromVal(isRange() ? Math.min(val, toVal()) : val);
        } else {
            setToVal(Math.max(val, fromVal()));
        }

        render();
    };

    const onPointerUp = () => {
        dragging = null;
    };

    // Effects
    createEffect(() => {
        render();
    });

    onMount(() => {
        if (!sliderRef) return;

        sliderRef.addEventListener("pointerdown", onPointerDown);
        sliderRef.addEventListener("pointermove", onPointerMove);
        sliderRef.addEventListener("pointerup", onPointerUp);
        sliderRef.addEventListener("pointercancel", onPointerUp);

        // Initial render
        render();
    });

    return (
        <div
            ref={sliderRef}
            class={cn("slider", local.class, local.size, local.color)}
            {...others}
        >
            <div class="slider-fill"></div>

            <Show when={local.steps}>
                <div class="slider-steps">
                    {Array.from({ length: max() - min() + 1 }, (_, i) => (
                        <span class="slider-step" />
                    ))}
                </div>
            </Show>

            <div class="slider-thumb" data-thumb="from"></div>

            <Show when={isRange()}>
                <div class="slider-thumb" data-thumb="to"></div>
            </Show>
        </div>
    );
}

export { Slider, SliderRange };

export type { SliderProps, SliderRangeProps };
