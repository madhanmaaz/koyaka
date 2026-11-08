import type { Placement, Align } from "./types";

type RectPoint = {
    clientX?: number;
    clientY?: number;
    x?: number;
    y?: number;
} | null;

interface PositionOptions {
    trigger: HTMLElement;
    content: HTMLElement;
    gap: number;
    margin: number;
    placement: Placement;
    align: Align;
    rectPoint: RectPoint;
}

interface PositionResult {
    top: number;
    left: number;
    placement: Placement;
    align: Align;
}

type PositionRect = Pick<
    DOMRect,
    "top" | "bottom" | "left" | "right" | "width" | "height"
>;

const OPPOSITE: Record<Placement, Placement> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
};

function getHorizontalPosition(
    triggerRect: PositionRect,
    contentWidth: number,
    align: Align,
): number {
    switch (align) {
        case "start":
            return triggerRect.left;

        case "end":
            return triggerRect.right - contentWidth;

        case "center":
        default:
            return triggerRect.left + (triggerRect.width - contentWidth) / 2;
    }
}

function getVerticalPosition(
    triggerRect: PositionRect,
    contentHeight: number,
    align: Align,
): number {
    switch (align) {
        case "start":
            return triggerRect.top;

        case "end":
            return triggerRect.bottom - contentHeight;

        case "center":
        default:
            return triggerRect.top + (triggerRect.height - contentHeight) / 2;
    }
}

function getTriggerRect(
    trigger: HTMLElement,
    rectPoint: RectPoint,
): PositionRect {
    if (!rectPoint) {
        return trigger.getBoundingClientRect();
    }

    const x = rectPoint.clientX ?? rectPoint.x ?? 0;
    const y = rectPoint.clientY ?? rectPoint.y ?? 0;

    return {
        top: y,
        bottom: y,
        left: x,
        right: x,
        width: 0,
        height: 0,
    };
}

// Measure content at its layout position, ignoring the current transform.
function measureContent(content: HTMLElement): DOMRect {
    const previousTransform = content.style.transform;

    content.style.transform = "none";

    const rect = content.getBoundingClientRect();

    content.style.transform = previousTransform;

    return rect;
}

function computePosition({
    trigger,
    content,
    gap,
    margin,
    placement,
    align,
    rectPoint,
}: PositionOptions): PositionResult {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    const origin = measureContent(content);
    const { width, height } = origin;

    const triggerRect = getTriggerRect(trigger, rectPoint);

    const space: Record<Placement, number> = {
        top: triggerRect.top - gap,
        bottom: viewportHeight - triggerRect.bottom - gap,
        left: triggerRect.left - gap,
        right: viewportWidth - triggerRect.right - gap,
    };

    // Flip to the opposite side only if it has more available space.
    let computedPlacement = placement;

    const needed =
        placement === "top" || placement === "bottom" ? height : width;

    const opposite = OPPOSITE[placement];

    if (space[placement] < needed && space[opposite] > space[placement]) {
        computedPlacement = opposite;
    }

    let top = 0;
    let left = 0;

    switch (computedPlacement) {
        case "top":
            top = triggerRect.top - height - gap;
            left = getHorizontalPosition(triggerRect, width, align);
            break;

        case "right":
            left = triggerRect.right + gap;
            top = getVerticalPosition(triggerRect, height, align);
            break;

        case "left":
            left = triggerRect.left - width - gap;
            top = getVerticalPosition(triggerRect, height, align);
            break;

        case "bottom":
        default:
            top = triggerRect.bottom + gap;
            left = getHorizontalPosition(triggerRect, width, align);
            break;
    }

    // Clamp within the viewport. Margin takes priority.
    left = Math.max(margin, Math.min(left, viewportWidth - width - margin));

    top = Math.max(margin, Math.min(top, viewportHeight - height - margin));

    return {
        top: Math.round(top - origin.top),
        left: Math.round(left - origin.left),
        placement: computedPlacement,
        align,
    };
}

export { computePosition };

export type { PositionOptions, PositionResult, PositionRect, RectPoint };
