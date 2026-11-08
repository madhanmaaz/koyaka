import {
    classListContains,
    classListToggle,
    getDataset,
    querySelector,
    querySelectorAll,
    setAttribute,
    setKoyaka,
} from "../helpers/dom.js";
import { addEvent, emitEvent, EVENT_VALUE_CHANGE } from "../helpers/events.js";
import { createCleanup } from "../helpers/cleanup.js";

export function tabsHandler(tabs) {
    const onCleanup = createCleanup(tabs);
    const defaultValue = getDataset(tabs, "defaultValue");

    setAttribute(tabs, "role", "tablist");

    const tabsList = querySelector(".tabs-list", tabs);
    if (!tabsList) return;

    const triggers = querySelectorAll(".tabs-trigger", tabsList).map(
        (trigger, index) => {
            const value = getDataset(trigger, "value", String(index));
            const id = `tab-trigger-${value}`;
            const panelId = `tab-panel-${value}`;

            setAttribute(trigger, "role", "tab");
            setAttribute(trigger, "id", trigger.id || id);
            setAttribute(trigger, "aria-controls", panelId);
            setAttribute(trigger, "aria-selected", "false");
            setAttribute(trigger, "tabindex", "-1");

            return { trigger, value, id, panelId };
        },
    );

    if (!triggers.length) return;

    const contents = [...tabs.children]
        .filter((content) => classListContains(content, "tabs-content"))
        .filter(Boolean)
        .map((content, index) => {
            const value = getDataset(content, "value", String(index));
            const panelId = `tab-panel-${value}`;
            const triggerId = `tab-trigger-${value}`;

            setAttribute(content, "role", "tabpanel");
            setAttribute(content, "id", content.id || panelId);
            setAttribute(content, "aria-labelledby", triggerId);
            setAttribute(content, "tabindex", "0");

            return { content, value };
        });

    function activate(value, moveFocus = false) {
        triggers.forEach(({ trigger, value: v }) => {
            const isActive = v === value;

            classListToggle(trigger, "active", isActive);
            setAttribute(trigger, "aria-selected", String(isActive));
            setAttribute(trigger, "tabindex", isActive ? "0" : "-1");
            if (isActive && moveFocus) trigger.focus();
        });

        contents.forEach(({ content, value: v }) => {
            classListToggle(content, "active", v === value);
        });

        tabs._tabsValue = value;

        emitEvent(tabs, EVENT_VALUE_CHANGE, { value });
    }

    // Click
    triggers.forEach(({ trigger, value }) => {
        onCleanup(
            addEvent(trigger, "click", () => {
                activate(value, false);
            }),
        );
    });

    // Keyboard navigation
    onCleanup(
        addEvent(tabsList, "keydown", (e) => {
            const index = triggers.findIndex(
                ({ trigger }) => trigger === document.activeElement,
            );
            if (index === -1) return;

            const map = {
                ArrowRight: (i) => (i + 1) % triggers.length,
                ArrowLeft: (i) => (i - 1 + triggers.length) % triggers.length,
                Home: () => 0,
                End: () => triggers.length - 1,
            };

            const next = map[e.key]?.(index);
            if (next === undefined) return;

            e.preventDefault();
            activate(triggers[next].value, true);
        }),
    );

    // Initial active tab
    const initialValue =
        defaultValue ||
        triggers.find(({ trigger }) => classListContains(trigger, "active"))
            ?.value ||
        triggers[0].value;

    activate(initialValue);

    setKoyaka(tabs, {
        getValue() {
            return tabs._tabsValue;
        },
        setValue(v) {
            const match = triggers.find(({ value }) => value === v);
            if (match) activate(v);
        },
    });
}
