import type { AxonBoxType } from "./constants.ts";
import { AXON_BOX, TAG_NAMES } from "./constants.ts";

/**
 * Axon box element with performance optimizations, touch support,
 * and proper integration with the axon graph system.
 */
export class AxonBox extends HTMLElement implements AxonBoxType {
  [AXON_BOX] = true as const;

  #x = 0;
  #y = 0;
  lastRenderedValue: unknown;

  get x() {
    return this.#x;
  }
  set x(v) {
    this.#x = v;
    this.update();
  }

  get y() {
    return this.#y;
  }
  set y(v) {
    this.#y = v;
    this.update();
  }

  connectedCallback() {
    this.#x = parseInt(this.getAttribute("x") || "0");
    this.#y = parseInt(this.getAttribute("y") || "0");
    this.update();
  }

  update() {
    this.style.transform = `translate3d(${this.#x}px, ${this.#y}px, 0)`;
    this.dispatchEvent(new CustomEvent("node-move", { bubbles: true }));
  }
}
customElements.define(TAG_NAMES.AXON_BOX, AxonBox);
