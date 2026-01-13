import {
  customElement,
  property,
  query,
  state,
} from "lit-element/decorators.js";
import { LitElement } from "lit-element/lit-element.js";
import {
  NODE_GRAPH,
  type NodeBoxType,
  type NodeEdgeType,
  type NodeGraphType,
  type Point,
  TAG_NAMES,
} from "./constants.ts";
import { css, html } from "lit-element";
import { isNodePort } from "../helpers.ts";

@customElement(TAG_NAMES.NODE_GRAPH)
export class NodeGraph extends LitElement implements NodeGraphType {
  [NODE_GRAPH] = true as const;
  @property({ type: Number })
  zoomLevel = 1;
  @property({ type: Object })
  panPos = { x: 0, y: 0 };
  @property({ type: Number })
  gridSize = 20;
  @property({ type: Boolean })
  snapEnabled = true;
  @property({ type: Boolean })
  orthogonal = false;

  @state()
  private _isConnecting = false;
  @state()
  private _selectionBox: { start: Point; current: Point; active: boolean } = {
    start: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    active: false,
  };

  @query("#svg")
  private _svg!: SVGSVGElement;
  @query("#vp")
  private _vp!: HTMLDivElement;

  private _connStartPort: any = null;
  private _hoveredPort: any = null;

  static override styles = css`
    :host {
      --graph-bg: #0f172a;
      --graph-border: #1e293b;
      --grid-color: #334155;
      --edge-color: #475569;
      --edge-width: 2px;
      --edge-hover-color: #ef4444;
      --ghost-edge-color: #38bdf8;
      --selection-window-border: #3b82f6;
      --selection-window-bg: rgba(59, 130, 246, 0.15);
      --selection-crossing-border: #10b981;
      --selection-crossing-bg: rgba(16, 185, 129, 0.15);

      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: var(--graph-bg);
      background-image: radial-gradient(var(--grid-color) 1px, transparent 0);
      border: 1px solid var(--graph-border);
    }
    .viewport {
      width: 100%;
      height: 100%;
      transform-origin: 0 0;
      will-change: transform;
    }
    svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 10000px;
      height: 10000px;
      pointer-events: none;
      z-index: 5;
    }
    path {
      fill: none;
      stroke-width: var(--edge-width);
      transition: stroke 0.2s;
      stroke-linecap: round;
      stroke-linejoin: round;
      pointer-events: visibleStroke;
    }
    .edge-group {
      cursor: pointer;
    }
    .edge-group:hover .main-line {
      stroke: var(--edge-hover-color);
      stroke-width: 3px;
    }
    .ghost {
      stroke: var(--ghost-edge-color);
      stroke-dasharray: 4;
      opacity: 0.6;
    }
    .click-area {
      stroke: transparent;
      stroke-width: 15px;
    }

    .selection-box {
      position: absolute;
      pointer-events: none;
      z-index: 100;
    }
    .selection-box.window {
      border: 1px solid var(--selection-window-border);
      background: var(--selection-window-bg);
    }
    .selection-box.crossing {
      border: 1px dashed var(--selection-crossing-border);
      background: var(--selection-crossing-bg);
    }
  `;

  override render() {
    const isCrossing =
      this._selectionBox.current.x < this._selectionBox.start.x;
    const left = Math.min(
      this._selectionBox.start.x,
      this._selectionBox.current.x,
    );
    const top = Math.min(
      this._selectionBox.start.y,
      this._selectionBox.current.y,
    );
    const width = Math.abs(
      this._selectionBox.start.x - this._selectionBox.current.x,
    );
    const height = Math.abs(
      this._selectionBox.start.y - this._selectionBox.current.y,
    );

    return html`
      <div
        class="viewport"
        id="vp"
        style="transform: translate(${this.panPos.x}px, ${this.panPos
          .y}px) scale(${this.zoomLevel})"
      >
        <svg id="svg"></svg>
        <div class="content"><slot></slot></div>
      </div>
      ${this._selectionBox.active
        ? html`
          <div
            class="selection-box ${isCrossing ? "crossing" : "window"}"
            style="left:${left}px; top:${top}px; width:${width}px; height:${height}px;"
          >
          </div>
        `
        : ""}
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("node-move", () => this.draw());
    this.addEventListener("wheel", this._handleWheel, { passive: false });
    this.addEventListener("mousedown", this._handleMouseDown);

    new MutationObserver(() => this.draw()).observe(this, {
      childList: true,
      subtree: true,
    });
    setTimeout(() => this._bootstrap(), 100);
  }

  private _bootstrap() {
    (this.querySelectorAll(TAG_NAMES.NODE_EDGE) as NodeListOf<NodeEdgeType>)
      .forEach((edge: NodeEdgeType) => {
        const fromAttr = edge.getAttribute("from");
        const toAttr = edge.getAttribute("to");
        if (!fromAttr || !toAttr) return;

        const from = document.getElementById(fromAttr);
        const to = document.getElementById(toAttr);
        if (from && to && isNodePort(from) && isNodePort(to)) {
          to.value = from.value;
        }
      });
    this.draw();
  }

  clearSelection() {
    this.querySelectorAll("node-box").forEach((n: any) => n.selected = false);
  }

  handleConnectionStart(port: any) {
    this._connStartPort = port;
    this._isConnecting = true;
    document.body.classList.add("is-connecting");

    const rect = this.getBoundingClientRect();
    const onMove = (e: MouseEvent) => {
      this.draw({
        x: (e.clientX - rect.left - this.panPos.x) / this.zoomLevel,
        y: (e.clientY - rect.top - this.panPos.y) / this.zoomLevel,
      });
    };

    const onUp = () => {
      if (
        this._hoveredPort &&
        this._isValidConn(this._connStartPort, this._hoveredPort)
      ) {
        const from = this._connStartPort.tagName.includes("OUT")
          ? this._connStartPort
          : this._hoveredPort;
        const to = this._connStartPort.tagName.includes("IN")
          ? this._connStartPort
          : this._hoveredPort;
        const edge = document.createElement("node-edge");
        edge.setAttribute("from", from.id);
        edge.setAttribute("to", to.id);
        this.appendChild(edge);
        to.value = from.value;
      }
      this._isConnecting = false;
      this._connStartPort = null;
      document.body.classList.remove("is-connecting");
      this.draw();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  private _isValidConn(p1: any, p2: any) {
    return p1.tagName !== p2.tagName && p1.datatype === p2.datatype &&
      p1.closest("node-box") !== p2.closest("node-box");
  }

  private _handleWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.zoomLevel = Math.min(Math.max(this.zoomLevel * delta, 0.1), 3);
    this.style.backgroundSize = `${20 * this.zoomLevel}px ${
      20 * this.zoomLevel
    }px`;
    this.style.backgroundPosition = `${this.panPos.x}px ${this.panPos.y}px`;
  }

  private _handleMouseDown(e: MouseEvent) {
    if (e.target !== this && (e.target as HTMLElement).id !== "vp") return;
    const rect = this.getBoundingClientRect();
    const startMouse = { x: e.clientX, y: e.clientY };
    const startPan = { ...this.panPos };
    const isSelection = !e.altKey && e.button === 0;

    if (isSelection) {
      this._selectionBox = {
        start: { x: e.clientX - rect.left, y: e.clientY - rect.top },
        current: { x: e.clientX - rect.left, y: e.clientY - rect.top },
        active: true,
      };
    } else {
      document.body.classList.add("is-interacting");
    }

    const onMove = (me: MouseEvent) => {
      if (isSelection) {
        this._selectionBox = {
          ...this._selectionBox,
          current: { x: me.clientX - rect.left, y: me.clientY - rect.top },
        };
        this._processSelection(e.shiftKey);
      } else {
        this.panPos = {
          x: startPan.x + (me.clientX - startMouse.x),
          y: startPan.y + (me.clientY - startMouse.y),
        };
        this.style.backgroundPosition = `${this.panPos.x}px ${this.panPos.y}px`;
      }
    };

    const onUp = () => {
      this._selectionBox = { ...this._selectionBox, active: false };
      document.body.classList.remove("is-interacting");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  private _processSelection(isShift: boolean) {
    const boxRect = this.shadowRoot?.querySelector(".selection-box")
      ?.getBoundingClientRect();
    if (!boxRect) return;

    const isCrossing =
      this._selectionBox.current.x < this._selectionBox.start.x;

    (this.querySelectorAll("node-box") as NodeListOf<NodeBoxType>).forEach(
      (node: NodeBoxType) => {
        const nodeRect = node.getBoundingClientRect();
        let match = false;
        if (isCrossing) {
          match =
            !(nodeRect.right < boxRect.left || nodeRect.left > boxRect.right ||
              nodeRect.bottom < boxRect.top || nodeRect.top > boxRect.bottom);
        } else {
          match = nodeRect.left >= boxRect.left &&
            nodeRect.right <= boxRect.right && nodeRect.top >= boxRect.top &&
            nodeRect.bottom <= boxRect.bottom;
        }
        if (match) node.selected = true;
        else if (!isShift) node.selected = false;
      },
    );
  }

  draw(ghostTarget: Point | null = null) {
    if (!this._svg) return;
    this._svg.innerHTML = "";
    (this.querySelectorAll(TAG_NAMES.NODE_EDGE) as NodeListOf<NodeEdgeType>)
      .forEach(
        (edge) => {
          const from = edge.getAttribute("from");
          const to = edge.getAttribute("to");

          if (!from || !to) return;

          const f = document.getElementById(from);
          const t = document.getElementById(to);

          if (!f || !t || !isNodePort(f) || !isNodePort(t)) return;

          if (f && t) this._renderPath(f.getCenter(), t.getCenter(), edge);
        },
      );
    if (this._isConnecting && ghostTarget) {
      this._renderPath(
        this._connStartPort.getCenter(),
        ghostTarget,
        null,
        true,
      );
    }
  }

  private _renderPath(start: Point, end: Point, el: any, ghost = false) {
    let d = "";
    if (this.orthogonal) {
      const midX = start.x + (end.x - start.x) / 2;
      d =
        `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    } else {
      const dx = Math.abs(end.x - start.x) * 0.45;
      d = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${
        end.x - dx
      } ${end.y}, ${end.x} ${end.y}`;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    if (ghost) {
      path.classList.add("ghost");
      this._svg.appendChild(path);
    } else {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("edge-group");
      const clickArea = path.cloneNode() as SVGPathElement;
      clickArea.classList.add("click-area");
      path.classList.add("main-line");
      path.setAttribute("stroke", "var(--edge-color)");
      g.appendChild(clickArea);
      g.appendChild(path);
      g.onclick = (ev) => {
        ev.stopPropagation();
        el.remove();
      };
      this._svg.appendChild(g);
    }
  }
}
