import type { NodeBoxType } from "./constants.ts";
import { NODE_BOX, TAG_NAMES } from "./constants.ts";

/**
 * Node box element with performance optimizations, touch support,
 * and proper integration with the node graph system.
 */
export class NodeBox extends HTMLElement implements NodeBoxType {
  [NODE_BOX] = true as const;

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

  static style = /*css*/ `
    :host {
        position: absolute;
        background: #1e293b;
        border-radius: 8px;
        border: 1px solid #334155;
    }

    .header {
        padding: 8px;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
    }

    .ports-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
  `;

  connectedCallback() {
    this.#x = parseInt(this.getAttribute("x") || "0");
    this.#y = parseInt(this.getAttribute("y") || "0");
    this.update();

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).innerHTML = /*html*/ `
        <style>${NodeBox.style}</style>
        <div class="header"><slot name="header"></slot></div>
        <div class="content"><slot></slot></div>
        <div class="ports-grid"><slot name="ports"></slot></div>
      `;
    }
  }

  update() {
    this.style.transform = `translate3d(${this.#x}px, ${this.#y}px, 0)`;
    this.dispatchEvent(new CustomEvent("node-move", { bubbles: true }));
  }
}
customElements.define(TAG_NAMES.NODE_BOX, NodeBox);
