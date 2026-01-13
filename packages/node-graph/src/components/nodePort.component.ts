import { LitElement } from "lit-element";
import {
  NODE_PORT,
  type NodePortBaseType,
  type Point,
  TAG_NAMES,
} from "./constants.ts";
import { customElement } from "lit-element/decorators.js";

@customElement(TAG_NAMES.NODE_PORT_IN)
export class NodePortIn extends LitElement implements NodePortBaseType {
  [NODE_PORT] = true as const;

  private _value: any = 0;

  get value() {
    return this._value;
  }
  set value(v: any) {
    if (this._value === v) return;
    this._value = v;
    this.closest("node-box")?.dispatchEvent(
      new CustomEvent("node-update", { bubbles: true }),
    );
  }

  get datatype() {
    return this.getAttribute("datatype") || "default";
  }

  getCenter(): Point {
    const rect = this.getBoundingClientRect();
    const graph = this.closest("node-graph") as any;
    if (!graph) return { x: 0, y: 0 };
    const graphRect = graph.getBoundingClientRect();
    return {
      x: (rect.left - graphRect.left - graph.panPos.x) / graph.zoomLevel,
      y: (rect.top - graphRect.top - graph.panPos.y) / graph.zoomLevel +
        (rect.height / 2 / graph.zoomLevel),
    };
  }

  overrideconnectedCallback() {
    this.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      const graph = this.closest("node-graph") as any;
      const existing = graph.querySelector(`node-edge[to="${this.id}"]`);
      if (existing) {
        const fromPort = document.getElementById(existing.getAttribute("from"));
        existing.remove();
        this.value = 0;
        graph.handleConnectionStart(fromPort);
      } else {
        graph.handleConnectionStart(this);
      }
    });
  }
}

@customElement(TAG_NAMES.NODE_PORT_OUT)
export class NodePortOut extends HTMLElement {
  private _value: any = 0;

  get value() {
    return this._value;
  }
  set value(v: any) {
    if (this._value === v) return;
    this._value = v;
    const graph = this.closest("node-graph");
    if (graph) {
      graph.querySelectorAll(`node-edge[from="${this.id}"]`).forEach(
        (edge: any) => {
          const target = document.getElementById(
            edge.getAttribute("to"),
          ) as any;
          if (target) {
            target.value = v;
            edge.dispatchEvent(new CustomEvent("pulse"));
          }
        },
      );
    }
  }

  getCenter(): Point {
    const rect = this.getBoundingClientRect();
    const graph = this.closest("node-graph") as any;
    if (!graph) return { x: 0, y: 0 };
    const graphRect = graph.getBoundingClientRect();
    return {
      x: (rect.left - graphRect.left - graph.panPos.x) / graph.zoomLevel +
        (rect.width / graph.zoomLevel),
      y: (rect.top - graphRect.top - graph.panPos.y) / graph.zoomLevel +
        (rect.height / 2 / graph.zoomLevel),
    };
  }
}
