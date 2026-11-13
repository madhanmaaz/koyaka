import { onCleanup, Show, splitProps } from "solid-js";
import type { JSX, ParentProps } from "solid-js";
import { Portal } from "solid-js/web";

import { cn } from "../../helpers/utils";
import type { Placement, Size } from "../../helpers/types";
import {
    OverlayBackdrop,
    OverlayClose,
    OverlayEngine,
    OverlayTrigger,
    useOverlay,
} from "../../shared/overlayEngine";
import type {
    OverlayBackdropProps,
    OverlayBackdropVariant,
    OverlayCloseProps,
    OverlayEngineProps,
    OverlayTriggerProps,
} from "../../shared/overlayEngine";

// width of a left/right sheet, top and bottom sheets size to their content
type SheetSize = Exclude<Size, "xs">;
type SheetPlacement = Extract<Placement, "left" | "right" | "top" | "bottom">;

// ─── Props ────────────────────────────────────────────────────────────────────
type SheetProps = ParentProps<OverlayEngineProps>;

interface SheetRootProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** Edge the sheet slides in from. Defaults to "left". */
    placement?: SheetPlacement;
    size?: SheetSize;
}

type SheetContentProps = JSX.HTMLAttributes<HTMLDivElement>;

// ─── Components ───────────────────────────────────────────────────────────────
function Sheet(props: SheetProps) {
    return <OverlayEngine {...props} />;
}

function SheetRoot(props: SheetRootProps) {
    const [local, others] = splitProps(props, [
        "placement",
        "size",

        "class",
        "children",
    ]);

    const { setRootRef, isActive, isClosing } = useOverlay();

    const setRef = (el: HTMLDivElement) => {
        setRootRef(el);
        onCleanup(() => setRootRef(undefined));
    };

    return (
        <Show when={isActive()}>
            <Portal>
                <div
                    role="dialog"
                    aria-modal="true"
                    {...others}
                    ref={setRef}
                    class={cn(
                        "sheet active",
                        isClosing() ? "closing" : undefined,
                        local.placement,
                        local.size,
                        local.class,
                    )}
                >
                    {local.children}
                </div>
            </Portal>
        </Show>
    );
}

function SheetContent(props: SheetContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div {...others} class={cn("overlay-content", local.class)}>
            {local.children}
        </div>
    );
}

export {
    Sheet,
    SheetRoot,
    SheetContent,
    OverlayTrigger as SheetTrigger,
    OverlayClose as SheetClose,
    OverlayBackdrop as SheetBackdrop,
};

export type {
    SheetProps,
    SheetRootProps,
    SheetContentProps,
    SheetSize,
    SheetPlacement,
    OverlayTriggerProps as SheetTriggerProps,
    OverlayCloseProps as SheetCloseProps,
    OverlayBackdropProps as SheetBackdropProps,
    OverlayBackdropVariant as SheetBackdropVariant,
};
