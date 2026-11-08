import { onCleanup, Show, splitProps } from "solid-js";
import type { JSX, ParentProps } from "solid-js";
import { Portal } from "solid-js/web";

import { cn } from "../../helpers/utils";
import type { Align, Placement, Size } from "../../helpers/types";
import { OverlayEngine, useOverlay } from "../../shared/overlayEngine";
import type { OverlayEngineProps } from "../../shared/overlayEngine";

type ModalSize = Exclude<Size, "xs"> | "cover" | "full";
type ModalBackdropVariant = "blur" | "transparent";

// ─── Props ────────────────────────────────────────────────────────────────────
type ModalProps = ParentProps<OverlayEngineProps>;

interface ModalRootProps extends JSX.HTMLAttributes<HTMLDivElement> {
    placement?: Placement;
    align?: Align;
    size?: ModalSize;
    sheet?: boolean;
}

type ModalTriggerProps = JSX.HTMLAttributes<HTMLSpanElement>;
type ModalCloseProps = JSX.HTMLAttributes<HTMLSpanElement>;
type ModalContentProps = JSX.HTMLAttributes<HTMLDivElement>;

interface ModalBackdropProps extends JSX.HTMLAttributes<HTMLDivElement> {
    variant?: ModalBackdropVariant;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// keeps the user's own handler working (function or [handler, data])
function callHandler<E extends Event>(handler: unknown, e: E) {
    if (typeof handler === "function") {
        handler(e);
    } else if (Array.isArray(handler)) {
        handler[0](handler[1], e);
    }
}

// Enter and Space press a non-button element
function onPress(e: KeyboardEvent, action: () => void) {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        action();
    }
}

// ─── Components ───────────────────────────────────────────────────────────────
function Modal(props: ModalProps) {
    return <OverlayEngine {...props}>{props.children}</OverlayEngine>;
}

function ModalRoot(props: ModalRootProps) {
    const [local, others] = splitProps(props, [
        "placement",
        "align",
        "size",
        "sheet",

        "class",
        "children",
    ]);

    const { setRootRef, isActive, isClosing } = useOverlay();

    const setRef = (el: HTMLDivElement) => {
        setRootRef(el);
        onCleanup(() => setRootRef(undefined));
    };

    return (
        // isActive stays true while the close animation plays
        <>
            <div data-value={isActive() || isClosing()}></div>

            <Show when={isActive() || isClosing()}>
                <Portal>
                    <div
                        role="dialog"
                        aria-modal="true"
                        {...others}
                        ref={setRef}
                        class={cn(
                            "modal active",
                            local.placement,
                            local.align,
                            local.size,
                            local.sheet && "sheet",
                            isClosing() && "closing",
                            local.class,
                        )}
                    >
                        {local.children}
                    </div>
                </Portal>
            </Show>
        </>
    );
}

function ModalTrigger(props: ModalTriggerProps) {
    const [local, others] = splitProps(props, [
        "class",
        "children",
        "onClick",
        "onKeyDown",
    ]);
    const { toggle, isActive } = useOverlay();

    return (
        <span
            role="button"
            tabindex={0}
            aria-haspopup="dialog"
            aria-expanded={isActive()}
            {...others}
            class={cn(local.class)}
            onClick={(e) => {
                callHandler(local.onClick, e);
                toggle();
            }}
            onKeyDown={(e) => {
                callHandler(local.onKeyDown, e);
                onPress(e, toggle);
            }}
        >
            {local.children}
        </span>
    );
}

function ModalClose(props: ModalCloseProps) {
    const [local, others] = splitProps(props, [
        "class",
        "children",
        "onClick",
        "onKeyDown",
    ]);
    const { hide } = useOverlay();

    return (
        <span
            role="button"
            tabindex={0}
            {...others}
            class={cn(local.class)}
            onClick={(e) => {
                callHandler(local.onClick, e);
                hide();
            }}
            onKeyDown={(e) => {
                callHandler(local.onKeyDown, e);
                onPress(e, hide);
            }}
        >
            {local.children}
        </span>
    );
}

// closes on click. Leave it out for a modal that must not close on backdrop click
function ModalBackdrop(props: ModalBackdropProps) {
    const [local, others] = splitProps(props, ["class", "variant", "onClick"]);
    const { hide } = useOverlay();

    return (
        <div
            aria-hidden="true"
            {...others}
            class={cn("modal-backdrop", local.variant, local.class)}
            onClick={(e) => {
                callHandler(local.onClick, e);
                hide();
            }}
        />
    );
}

function ModalContent(props: ModalContentProps) {
    const [local, others] = splitProps(props, ["class", "children"]);

    return (
        <div {...others} class={cn("modal-content", local.class)}>
            {local.children}
        </div>
    );
}

export {
    Modal,
    ModalRoot,
    ModalTrigger,
    ModalClose,
    ModalBackdrop,
    ModalContent,
};

export type {
    ModalProps,
    ModalRootProps,
    ModalTriggerProps,
    ModalCloseProps,
    ModalBackdropProps,
    ModalContentProps,
    ModalSize,
    ModalBackdropVariant,
};
