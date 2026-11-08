// open escape-closable layers (modals, floating content) in mount order
class EscapeStack {
    #layers = [];
    #handled = new WeakSet();

    push(layer) {
        // re-pushing moves the layer to the top instead of duplicating it
        this.remove(layer);
        this.#layers.push(layer);
    }

    remove(layer) {
        const index = this.#layers.indexOf(layer);
        if (index !== -1) this.#layers.splice(index, 1);
    }

    get top() {
        return this.#layers[this.#layers.length - 1];
    }

    // true only for the top layer, and only once per keydown event
    shouldHandle(e, layer) {
        if (e.key !== "Escape" || this.#handled.has(e)) return false;
        if (this.top !== layer) return false;

        this.#handled.add(e);
        return true;
    }
}

export const globalEscapeStack = new EscapeStack();
export { EscapeStack };
