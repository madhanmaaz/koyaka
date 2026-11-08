export type {
    ModalProps,
    ModalRootProps,
    ModalTriggerProps,
    ModalCloseProps,
    ModalBackdropProps,
    ModalContentProps,
    ModalSize,
    ModalBackdropVariant,
} from "./modal";

import {
    Modal,
    ModalRoot,
    ModalTrigger,
    ModalClose,
    ModalBackdrop,
    ModalContent,
} from "./modal";

export {
    Modal,
    ModalRoot,
    ModalTrigger,
    ModalClose,
    ModalBackdrop,
    ModalContent,
};

export default Object.assign(Modal, {
    Root: ModalRoot,
    Trigger: ModalTrigger,
    Close: ModalClose,
    Backdrop: ModalBackdrop,
    Content: ModalContent,
}) satisfies typeof Modal & {
    Root: typeof ModalRoot;
    Trigger: typeof ModalTrigger;
    Close: typeof ModalClose;
    Backdrop: typeof ModalBackdrop;
    Content: typeof ModalContent;
};
