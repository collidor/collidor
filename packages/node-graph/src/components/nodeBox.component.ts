import { css, html, LitElement, PropertyValues } from "lit-element";
import { customElement, property, state } from "lit-element/decorators.js";

import {
  createNodeMoveEvent,
  createNodeUpdateEvent,
} from "../events/nodeMove.event.ts";
import {
  classList,
  NODE_BOX,
  NODE_PORT,
  type NodeBoxType,
  type NodeGraphType,
  type NodePortBaseType,
  TAG_NAMES,
} from "./constants.ts";

@customElement("node-box")
export class NodeBox extends LitElement implements NodeBoxType {
  static ignoreClickElements = [
    "node-port-in",
    "node-port-out",
    "input",
    "select",
    "button",
  ];

  [NODE_BOX] = true as const;
  @property({ type: Number, reflect: true })
  x = 0;
  @property({ type: Number, reflect: true })
  y = 0;
  @property({ type: Boolean, reflect: true })
  selected = false;

  @state()
  isDragging = false;

  static override styles = css`
    :host {
      position: absolute;
      display: flex;
      flex-direction: column;
      background: #1e293b;
      border: 1px solid #334155;
      color: white;
      min-width: 160px;
      border-radius: 6px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
      z-index: 10;
      user-select: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    :host([selected]) {
      border-color: var(--node-selected-border, #38bdf8);
      box-shadow: 0 0 15px var(--node-selected-glow, rgba(56, 189, 248, 0.3));
      z-index: 20;
    }
    :host(.dragging) {
      opacity: 0.9;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      z-index: 100;
    }
  `;

  override render() {
    return html`
      <slot></slot>
    `;
  }

  protected override updated(changedProperties: PropertyValues) {
    if (changedProperties.has("x") || changedProperties.has("y")) {
      this.style.transform = `translate(${this.x}px, ${this.y}px)`;
      this.dispatchEvent(
        createNodeMoveEvent({ bubbles: true, composed: true }),
      );
    }
  }

  constructor() {
    super();
    this.addEventListener("mousedown", this._handleMouseDown);
  }

  private _handleMouseDown(e: MouseEvent) {
    if (
      e.target instanceof HTMLElement &&
      e.target.closest(NodeBox.ignoreClickElements.join(', '))
    ) return;
    e.stopPropagation();

    const graph = this.closest(TAG_NAMES.NODE_GRAPH) as NodeGraphType;
    if (!e.shiftKey && !this.selected) {
      graph.clearSelection();
    }
    this.selected = true;

    const selectedNodes = Array.from(
      graph.querySelectorAll("node-box[selected]"),
    ) as NodeBox[];
    selectedNodes.forEach((n) => n.classList.add("dragging"));
    document.body.classList.add("is-interacting");

    const zoom = graph.zoomLevel;
    const snap = graph.snapEnabled ? graph.gridSize : 1;
    const startX = e.clientX, startY = e.clientY;
    const startPositions = selectedNodes.map((n) => ({ n, x: n.x, y: n.y }));

    const onMove = (me: MouseEvent) => {
      const dx = (me.clientX - startX) / zoom;
      const dy = (me.clientY - startY) / zoom;
      startPositions.forEach((pos) => {
        pos.n.x = Math.round((pos.x + dx) / snap) * snap;
        pos.n.y = Math.round((pos.y + dy) / snap) * snap;
      });
    };

    const onUp = () => {
      selectedNodes.forEach((n) => n.classList.remove("dragging"));
      document.body.classList.remove("is-interacting");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
}
