export const defineProperty = Object.defineProperty;

export const uid = () => {
    return Math.random().toString(36).slice(2, 9);
};

export const prefersReducedMotion = () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const getAnimations = (element, opts = {}) => {
    const animations =
        prefersReducedMotion() || !element?.getAnimations
            ? []
            : element.getAnimations(opts).filter((animation) => {
                  const endTime = animation.effect?.getComputedTiming().endTime;
                  return Number.isFinite(endTime);
              });

    const allSettled = (finish) => {
        const settled = Promise.allSettled(animations.map((a) => a.finished));
        return finish ? settled.then(finish) : settled;
    };

    return {
        hasAnimations: animations.length > 0,
        animations,
        allSettled,
    };
};

let lockCount = 0;
let previousOverflow = "";

export const lockScroll = () => {
    if (lockCount++ === 0) {
        previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";
    }
};

export const unlockScroll = () => {
    if (lockCount === 0) return;

    if (--lockCount === 0) {
        document.documentElement.style.overflow = previousOverflow;
    }
};
