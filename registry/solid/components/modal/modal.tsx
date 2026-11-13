import { onCleanup, Show, splitProps } from "solid-js";
import type { JSX, ParentProps } from "solid-js";
import { Portal } from "solid-js/web";

import { cn } from "../../helpers/utils";
import type { Align, Placement, Size } from "../../helpers/types";
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

type ModalSize = Exclude<Size, "xs"> | "cover" | "full";

// ─── Props ────────────────────────────────────────────────────────────────────
type ModalProps = ParentProps<OverlayEngineProps>;

interface ModalRootProps extends JSX.HTMLAttributes<HTMLDivElement> {
    placement?: Extract<Placement, "top" | "bottom">;
    align?: Extract<Align, "start" | "end">;
    size?: ModalSize;
}

type ModalContentProps = JSX.HTMLAttributes<HTMLDivElement>;

// ─── Components ───────────────────────────────────────────────────────────────
function Modal(props: ModalProps) {
    return <OverlayEngine {...props} />;
}

function ModalRoot(props: ModalRootProps) {
    const [local, others] = splitProps(props, [
        "placement",
        "align",
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
                        "modal active",
                        isClosing() ? "closing" : undefined,
                        local.placement,
                        local.align,
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

function ModalContent(props: ModalContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div {...others} class={cn("overlay-content", local.class)}>
            {local.children}
        </div>
    );
}

export {
    Modal,
    ModalRoot,
    ModalContent,
    OverlayTrigger as ModalTrigger,
    OverlayClose as ModalClose,
    OverlayBackdrop as ModalBackdrop,
};

export type {
    ModalProps,
    ModalRootProps,
    ModalContentProps,
    ModalSize,
    OverlayTriggerProps as ModalTriggerProps,
    OverlayCloseProps as ModalCloseProps,
    OverlayBackdropProps as ModalBackdropProps,
    OverlayBackdropVariant as ModalBackdropVariant,
};
