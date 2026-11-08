import {
    classListAdd,
    classListContains,
    classListRemove,
    getDataset,
    setKoyaka,
} from "../helpers/dom.js";
import { globalEscapeStack } from "../helpers/escapeStack.js";
import { computePosition } from "../helpers/positioner.js";
import { getAnimations, uid } from "../helpers/utils.js";
import { addGlobalEvent } from "../helpers/events.js";

const CLOSE_TYPE = {
    OUTSIDE: "outside",
    INSIDE: "inside",
    ANY: "any",
    NONE: "none",
};

const ON_ACTION = {
    CLOSE: "close",
    POSITION: "position",
    NONE: "none",
};

const PLACEMENTS = ["top", "bottom", "left", "right"];
const ALIGNS = ["start", "center", "end"];

const CLOSE_TYPES = new Set(Object.values(CLOSE_TYPE));
const ON_ACTIONS = new Set(Object.values(ON_ACTION));

// invalid values fall back to the default instead of silently breaking
function pick(set, value, fallback) {
    return set.has(value) ? value : fallback;
}

function isScrollbarPress(e, content) {
    const el = e.target;
    if (!(el instanceof Element)) return false;

    // the content's own scrollbar is never an outside click
    if (content?.contains(el)) return false;

    // root scrollbar: clientWidth/Height exclude it, the pointer coordinates don't
    if (el === document.documentElement) {
        return e.clientX >= el.clientWidth || e.clientY >= el.clientHeight;
    }

    // any other scroll container
    const rect = el.getBoundingClientRect();

    return (
        e.clientX - rect.left >= el.clientLeft + el.clientWidth ||
        e.clientY - rect.top >= el.clientTop + el.clientHeight
    );
}

export class FloatingEngine {
    constructor({
        name,
        root,
        trigger,
        content,

        placement = "bottom",
        align = "center",
        margin = 14,
        gap = 0,

        onMount,
        onBeforeUnmount,
        onUnmount,

        closeType = CLOSE_TYPE.ANY,
        onEscape = ON_ACTION.CLOSE,
        onScroll = ON_ACTION.CLOSE,
        onResize = ON_ACTION.CLOSE,
        ignoreTrigger = true,

        // (target, engine, event) => false vetoes the close, anything else defers to closeType
        onClickShouldClose,
    }) {
        this.id = uid();
        this.name = name;
        this.root = root;
        this.trigger = trigger;
        this.content = content;

        this.placement =
            PLACEMENTS.find((side) => classListContains(root, side)) ??
            placement;
        this.align =
            ALIGNS.find((value) => classListContains(root, value)) ?? align;

        // dataset values are strings, so convert before any math
        this.gap = Number(getDataset(root, "gap", gap)) || 0; // space between trigger and content
        this.margin = Number(getDataset(root, "margin", margin)) || 0; // space from the screen edge

        this.onMount = onMount;
        this.onBeforeUnmount = onBeforeUnmount;
        this.onUnmount = onUnmount;

        this.closeType = pick(
            CLOSE_TYPES,
            getDataset(root, "closeType", closeType),
            closeType,
        );
        this.onEscape = pick(
            ON_ACTIONS,
            getDataset(root, "onEscape", onEscape),
            onEscape,
        );
        this.onScroll = pick(
            ON_ACTIONS,
            getDataset(root, "onScroll", onScroll),
            onScroll,
        );
        this.onResize = pick(
            ON_ACTIONS,
            getDataset(root, "onResize", onResize),
            onResize,
        );
        this.ignoreTrigger = ignoreTrigger;
        this.onClickShouldClose = onClickShouldClose;

        this.mounted = false;
        this.mountedAt = 0;
        this.cleanups = [];
        this._closeId = 0;

        this._handleEscape = this._handleEscape.bind(this);
        this._handleScroll = this._handleScroll.bind(this);
        this._handleResize = this._handleResize.bind(this);
        this._handleGlobalClick = this._handleGlobalClick.bind(this);
        this._handlePointerDown = this._handlePointerDown.bind(this);

        classListAdd(this.content, "floating");

        setKoyaka(root, {
            floatingEngine: this,
        });
    }

    _runAction(action) {
        switch (action) {
            case ON_ACTION.CLOSE:
                this.unmount();
                break;
            case ON_ACTION.POSITION:
                this.applyPosition();
                break;
            default:
                break;
        }
    }

    _handleEscape(e) {
        if (!globalEscapeStack.shouldHandle(e, this)) return;

        this.unmount();
    }

    _handleScroll(e) {
        // scrolling inside the content must not close or move it
        if (e.target instanceof Node && this.content.contains(e.target)) return;

        this._runAction(this.onScroll);
    }

    _handleResize() {
        this._runAction(this.onResize);
    }

    _handleGlobalClick(e) {
        const target = e.target;
        if (!(target instanceof Node)) return;

        // the click that opened this engine is still bubbling
        if (e.timeStamp <= this.mountedAt) return;

        if (this.onClickShouldClose?.(target, this, e) === false) return;

        const isInside = this.content.contains(target);

        if (this.ignoreTrigger && !isInside && this.trigger?.contains(target)) {
            return;
        }

        if (
            this.closeType === CLOSE_TYPE.ANY ||
            (this.closeType === CLOSE_TYPE.INSIDE && isInside) ||
            (this.closeType === CLOSE_TYPE.OUTSIDE && !isInside)
        ) {
            this.unmount();
        }
    }

    _handlePointerDown(e) {
        if (isScrollbarPress(e, this.content)) {
            this._handleGlobalClick(e);
        }
    }

    applyPosition({
        trigger,
        content,
        gap,
        margin,
        placement,
        align,
        rectPoint,
    } = {}) {
        const target = content ?? this.content;

        const position = computePosition({
            trigger: trigger ?? this.trigger,
            content: target,
            gap: gap ?? this.gap,
            margin: margin ?? this.margin,
            placement: placement ?? this.placement,
            align: align ?? this.align,
            rectPoint,
        });

        // the computed side may differ from the preferred one after a flip
        classListRemove(target, ...PLACEMENTS);
        classListAdd(target, position.placement);

        target.style.transform = `translate(${position.left}px, ${position.top}px)`;

        return position;
    }

    mount() {
        if (this.mounted) return this;
        this.mounted = true;
        this.mountedAt = performance.now();
        this._closeId++;

        classListRemove(this.content, "closing");

        if (this.closeType !== CLOSE_TYPE.NONE) {
            this.cleanups.push(
                addGlobalEvent("click", this._handleGlobalClick),
            );
            this.cleanups.push(
                addGlobalEvent("pointerdown", this._handlePointerDown),
            );
        }

        if (this.onEscape === ON_ACTION.CLOSE) {
            globalEscapeStack.push(this);
            this.cleanups.push(addGlobalEvent("keydown", this._handleEscape));
        }

        this.cleanups.push(
            addGlobalEvent(
                "scroll",
                this._handleScroll,
                { capture: true, passive: true },
                window,
            ),
        );

        this.cleanups.push(
            addGlobalEvent("resize", this._handleResize, false, window),
        );

        this.onMount?.(this);
        return this;
    }

    unmount() {
        if (!this.mounted) return this;
        this.mounted = false;

        globalEscapeStack.remove(this);

        this.cleanups.forEach((cleanup) => cleanup());
        this.cleanups = [];

        this.onBeforeUnmount?.(this);

        const closeId = ++this._closeId;

        const finish = () => {
            classListRemove(this.content, "closing");
            this.onUnmount?.(this);
        };

        classListAdd(this.content, "closing");

        const { hasAnimations, allSettled } = getAnimations(this.content);
        if (!hasAnimations) {
            finish();
        } else {
            allSettled(() => {
                // remounted while closing, so don't hide it
                if (closeId !== this._closeId) return;

                finish();
            });
        }

        return this;
    }
}
