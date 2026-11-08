import { createElement, getDataset, setKoyaka } from "../helpers/dom.js";
import { addEvent, emitEvent, EVENT_VALUE_CHANGE } from "../helpers/events.js";
import { createCleanup } from "../helpers/cleanup.js";

export function sliderHandler(slider) {
    const onCleanup = createCleanup(slider);
    const fillElement = <div class="slider-fill"></div>;
    const thumbFrom = <div class="slider-thumb" data-thumb="from"></div>;

    slider.appendChild(fillElement);
    slider.appendChild(thumbFrom);

    const isRange = getDataset(slider, "range") === "true";
    const hasSteps = getDataset(slider, "steps") === "true";
    const min = Number(getDataset(slider, "min", "0"));
    const max = Number(getDataset(slider, "max", "100"));

    let fromVal, toVal, dragging, thumbTo;

    if (isRange) {
        fromVal = Number(getDataset(slider, "minValue", String(min)));
        toVal = Number(getDataset(slider, "maxValue", String(max)));

        thumbTo = <div class="slider-thumb" data-thumb="to"></div>;
        slider.appendChild(thumbTo);
    } else {
        fromVal = Number(getDataset(slider, "value", String(min)));
        toVal = max;
    }

    if (hasSteps) {
        const fragment = new DocumentFragment();
        const steps = <div class="slider-steps"></div>;

        for (let i = 0; i < max + 1; i++) {
            const step = <span class="slider-step"></span>;
            fragment.appendChild(step);
        }

        steps.appendChild(fragment);
        slider.appendChild(steps);
    }

    function pctToVal(pct) {
        return Math.round(min + pct * (max - min));
    }

    function render() {
        const loPct = ((fromVal - min) / (max - min)) * 100;
        const hiPct = ((toVal - min) / (max - min)) * 100;

        thumbFrom.style.left = loPct + "%";

        if (isRange) {
            thumbTo.style.left = hiPct + "%";
            fillElement.style.left = loPct + "%";
            fillElement.style.width = hiPct - loPct + "%";
            emitEvent(slider, EVENT_VALUE_CHANGE, {
                isRange,
                from: fromVal,
                to: toVal,
            });
        } else {
            fillElement.style.left = "0%";
            fillElement.style.width = loPct + "%";
            emitEvent(slider, EVENT_VALUE_CHANGE, {
                isRange,
                value: fromVal,
            });
        }
    }

    function getVal(e) {
        const rect = slider.getBoundingClientRect();
        const pct = Math.max(
            0,
            Math.min(1, (e.clientX - rect.left) / rect.width),
        );
        return pctToVal(pct);
    }

    function getNearestThumb(val) {
        if (!isRange) return "from";
        const d1 = Math.abs(val - fromVal);
        const d2 = Math.abs(val - toVal);
        if (d1 === d2) return val < (max + min) / 2 ? "from" : "to";
        return d1 < d2 ? "from" : "to";
    }

    onCleanup(
        addEvent(slider, "pointerdown", (e) => {
            e.preventDefault();
            slider.setPointerCapture(e.pointerId);

            const val = getVal(e);

            if (e.target === thumbFrom) {
                dragging = "from";
            } else if (e.target === thumbTo) {
                dragging = "to";
            } else {
                dragging = getNearestThumb(val);
            }

            if (dragging === "from") {
                fromVal = isRange ? Math.min(val, toVal) : val;
            } else {
                toVal = Math.max(val, fromVal);
            }

            render();
        }),
    );

    onCleanup(
        addEvent(slider, "pointermove", (e) => {
            if (!dragging) return;

            const val = getVal(e);
            if (dragging === "from") {
                fromVal = isRange ? Math.min(val, toVal) : val;
            } else {
                toVal = Math.max(val, fromVal);
            }

            render();
        }),
    );

    onCleanup(
        addEvent(slider, "pointerup", () => {
            dragging = null;
        }),
    );

    onCleanup(
        addEvent(slider, "pointercancel", () => {
            dragging = null;
        }),
    );

    render();

    function clamp(val) {
        return Math.min(max, Math.max(min, Number(val)));
    }

    // single: setValue(30), range: setValue([20, 70])
    function setValue(value) {
        if (isRange) {
            const [from, to] = Array.isArray(value) ? value : [value, toVal];
            if (Number.isNaN(Number(from)) || Number.isNaN(Number(to))) return;

            fromVal = clamp(Math.min(from, to));
            toVal = clamp(Math.max(from, to));
        } else {
            const next = Array.isArray(value) ? value[0] : value;
            if (Number.isNaN(Number(next))) return;

            fromVal = clamp(next);
        }

        render();
    }

    setKoyaka(slider, {
        getValue() {
            return {
                from: fromVal,
                to: toVal,
                isRange,
            };
        },
        setValue,
    });
}
