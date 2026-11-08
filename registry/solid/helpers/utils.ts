// cn()
export type ClassValue =
    | string
    | number
    | null
    | false
    | undefined
    | ClassValue[]
    | Record<string, any>;

export function cn(...inputs: ClassValue[]): string {
    const classes: string[] = [];

    function process(input: ClassValue): void {
        if (!input) return;

        if (typeof input === "string" || typeof input === "number") {
            classes.push(String(input));

            return;
        }

        if (Array.isArray(input)) {
            input.forEach(process);
            return;
        }

        if (typeof input === "object") {
            Object.entries(input).forEach(([key, value]) => {
                if (value) {
                    classes.push(key);
                }
            });
        }
    }

    inputs.forEach(process);

    return classes.join(" ");
}

export const prefersReducedMotion = () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const getAnimations = (element: HTMLElement, opts = {}) => {
    const animations =
        prefersReducedMotion() || !element?.getAnimations
            ? []
            : element.getAnimations(opts).filter((animation) => {
                  const endTime = animation.effect?.getComputedTiming().endTime;
                  return Number.isFinite(endTime);
              });

    const allSettled = (finish: () => void) => {
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
