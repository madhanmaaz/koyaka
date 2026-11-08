const OPPOSITE = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
};

function getHorizontalPosition(triggerRect, contentWidth, align) {
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

function getVerticalPosition(triggerRect, contentHeight, align) {
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

function getTriggerRect(trigger, rectPoint) {
    if (!rectPoint) return trigger.getBoundingClientRect();

    const x = rectPoint.clientX ?? rectPoint.x;
    const y = rectPoint.clientY ?? rectPoint.y;

    return { top: y, bottom: y, left: x, right: x, width: 0, height: 0 };
}

// measure the content at its layout position, ignoring the current transform
function measureContent(content) {
    const previous = content.style.transform;

    content.style.transform = "none";
    const rect = content.getBoundingClientRect();
    content.style.transform = previous;

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
}) {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    const origin = measureContent(content);
    const { width, height } = origin;
    const triggerRect = getTriggerRect(trigger, rectPoint);

    const space = {
        top: triggerRect.top - gap,
        bottom: viewportHeight - triggerRect.bottom - gap,
        left: triggerRect.left - gap,
        right: viewportWidth - triggerRect.right - gap,
    };

    // flip to the opposite side only if it has more room
    let computedPlacement = placement;
    const needed =
        placement === "top" || placement === "bottom" ? height : width;
    const opposite = OPPOSITE[placement];

    if (
        opposite &&
        space[placement] < needed &&
        space[opposite] > space[placement]
    ) {
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
    }

    // clamp, margin wins when the content is larger than the viewport
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
