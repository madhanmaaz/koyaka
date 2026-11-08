export const setKoyaka = (element, options) => {
    if (!element.koyaka) {
        element.koyaka = {};
    }

    Object.assign(element.koyaka, options);
};

export const getKoyaka = (element) => {
    if (!element.koyaka) {
        element.koyaka = {};
    }

    return element.koyaka;
};

// Selector
export const querySelector = (selector, root = document) => {
    return root.querySelector(selector);
};

export const querySelectorAll = (selector, root = document) => {
    return [...root.querySelectorAll(selector)];
};

// dataset
export const getDataset = (element, datasetName, fallback = null) => {
    const value = element.dataset[datasetName];

    return value ?? fallback;
};

export const setDataset = (element, datasetName, value) => {
    element.dataset[datasetName] = value;
};

export const hasDataset = (element, datasetName) => {
    return datasetName in element.dataset;
};

export const removeDataset = (element, datasetName) => {
    delete element.dataset[datasetName];
};

// Attribute
export const getAttribute = (element, attributeName, fallback = null) => {
    const value = element.getAttribute(attributeName);

    return value ?? fallback;
};

export const hasAttribute = (element, attributeName) => {
    return element.hasAttribute(attributeName);
};

export const setAttribute = (element, attributeName, attributeValue = "") => {
    element.setAttribute(attributeName, attributeValue);
};

export const removeAttribute = (element, attributeName) => {
    element.removeAttribute(attributeName);
};

// classList
export const classListAdd = (element, ...classNames) => {
    element.classList.add(...classNames);
};

export const classListContains = (element, className) => {
    return element.classList.contains(className);
};

export const classListRemove = (element, ...classNames) => {
    element.classList.remove(...classNames);
};

export const classListToggle = (element, className, force) => {
    return element.classList.toggle(className, force);
};

// createElement
export const createElement = (tagName, props = {}, ...children) => {
    const element = document.createElement(tagName);

    Object.entries(props || {}).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        // events
        if (key.startsWith("on") && typeof value === "function") {
            element.addEventListener(key.slice(2).toLowerCase(), value);

            return;
        }

        // className
        if (key === "class" || key === "className") {
            element.className = value;

            return;
        }

        // style object
        if (key === "style" && typeof value === "object") {
            Object.assign(element.style, value);

            return;
        }

        // boolean attrs
        if (value === true) {
            element.setAttribute(key, "");
            return;
        }

        // dom props
        if (key in element) {
            element[key] = value;
            return;
        }

        // attributes
        element.setAttribute(key, String(value));
    });

    children.forEach((child) => {
        if (child === null || child === undefined || child === false) {
            return;
        }

        if (typeof child === "string" || typeof child === "number") {
            element.appendChild(document.createTextNode(String(child)));

            return;
        }

        if (child instanceof Node) {
            element.appendChild(child);
        }
    });

    return element;
};

export const createIcon = (iconSvgString) => {
    return (props) => {
        const element = createElement("div", {
            class: "icon",
            ...(props || {}),
        });

        element.innerHTML = iconSvgString;
        return element;
    };
};
