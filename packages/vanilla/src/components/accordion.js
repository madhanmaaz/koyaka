import {
    classListAdd,
    classListContains,
    classListRemove,
    classListToggle,
    getDataset,
    querySelector,
    setAttribute,
    setDataset,
    setKoyaka,
} from "../helpers/dom.js";
import { addEvent, emitEvent, EVENT_VALUE_CHANGE } from "../helpers/events.js";
import { uid } from "../helpers/utils.js";
import { createCleanup } from "../helpers/cleanup.js";

export function accordionHandler(accordion) {
    const onCleanup = createCleanup(accordion);

    const type = getDataset(accordion, "type", "multiple");
    const disabled = getDataset(accordion, "disabled") === "true";
    const defaultValue = getDataset(accordion, "defaultValue", "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

    // A11Y: role
    setAttribute(accordion, "role", "region");

    const accordionItems = [...accordion.children].filter((el) => {
        return classListContains(el, "accordion-item");
    });

    function getValues() {
        return accordionItems.map((item) => {
            return {
                active: classListContains(item, "active"),
                element: item,
            };
        });
    }

    function emitValueChange() {
        emitEvent(accordion, EVENT_VALUE_CHANGE, getValues());
    }

    function updateA11y() {
        accordionItems.forEach((accordionItem) => {
            const trigger = querySelector(".accordion-trigger", accordionItem);
            const content = querySelector(".accordion-content", accordionItem);
            if (!trigger || !content) return;

            const expanded = classListContains(accordionItem, "active");
            setAttribute(trigger, "aria-expanded", expanded);
        });
    }

    function setDisabledState(accordionItem, disabled = true) {
        const trigger = querySelector(".accordion-trigger", accordionItem);
        if (!trigger) return;

        if (disabled) {
            classListRemove(accordionItem, "active");
            classListAdd(trigger, "disabled");
        } else {
            classListRemove(trigger, "disabled");
        }

        trigger.disabled = disabled;
        setAttribute(trigger, "aria-disabled", disabled);
    }

    function isDisabled(accordionItem) {
        const trigger = querySelector(".accordion-trigger", accordionItem);
        return (
            trigger &&
            (trigger.disabled || classListContains(trigger, "disabled"))
        );
    }

    accordionItems.forEach((accordionItem, index) => {
        const trigger = querySelector(".accordion-trigger", accordionItem);
        const content = querySelector(".accordion-content", accordionItem);
        if (!trigger || !content) return;

        if (!getDataset(accordionItem, "value")) {
            setDataset(accordionItem, "value", String(index));
        }

        const value = getDataset(accordionItem, "value");

        // A11Y IDs
        const id = uid();
        const triggerId = `accordion-trigger-${id}`;
        const contentId = `accordion-content-${id}`;

        trigger.id ||= triggerId;
        content.id ||= contentId;

        // A11Y roles
        setAttribute(trigger, "aria-controls", content.id);
        setAttribute(content, "aria-labelledby", trigger.id);

        // Default values
        if (defaultValue.includes(value)) {
            classListAdd(accordionItem, "active");
        }

        if (disabled) {
            setDisabledState(accordionItem);
        }
    });

    onCleanup(
        addEvent(accordion, "click", (e) => {
            const trigger = e.target.closest(".accordion-trigger");
            if (!trigger) return;

            const accordionItem = trigger.closest(".accordion-item");
            if (!accordionItem) return;

            const content = querySelector(".accordion-content", accordionItem);
            if (!content) return;

            if (isDisabled(accordionItem)) return;

            if (type === "single") {
                const isActive = classListContains(accordionItem, "active");

                accordionItems.forEach((el) => {
                    classListRemove(el, "active");
                });

                if (!isActive) {
                    classListAdd(accordionItem, "active");
                }
            } else {
                classListToggle(accordionItem, "active");
            }

            updateA11y();
            emitValueChange();
        }),
    );

    updateA11y();

    setKoyaka(accordion, {
        getValue() {
            return getValues();
        },
        setValue(value) {
            const values = Array.isArray(value) ? value : [value];

            accordionItems.forEach((accordionItem) => {
                const itemValue = getDataset(accordionItem, "value");

                classListToggle(
                    accordionItem,
                    "active",
                    values.includes(itemValue),
                );
            });

            updateA11y();
        },
        disabled(value) {
            accordionItems.forEach((accordionItem) => {
                setDisabledState(accordionItem, value);
            });
        },
    });
}
