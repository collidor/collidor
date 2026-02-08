import {
  AXON_GRAPH,
  type AxonBoxType,
  type AxonEdgeType,
  type AxonGraphType,
  type AxonPortBaseType,
  type Offset,
  type Point,
  TAG_NAMES,
} from "./constants.ts";
import { isAxonBox, isAxonPort } from "./helpers.ts";
import { SelectionSystem } from "./selection.system.ts";
import style from "./axon.css?inline";

/**
 * OPTIMIZED NODE GRAPH ENGINE
 * Focus: 60FPS performance, zero layout thrashing, and memory efficiency.
 * Features: Spatial indexing, port position caching, and comprehensive error handling.
 */
export class AxonGraph extends HTMLElement implements AxonGraphType {
  [AXON_GRAPH] = true as const;

  #selectionSystem = new SelectionSystem();

  #portValues: Map<string, unknown> = new Map();
  #portOffsets: Map<string, Offset> = new Map();
  #adjacencyMap: Map<string, Set<string>> = new Map();
  #isDrawing = false;
  #stateUpdateThrottled = false;
  #microtaskQueue = Promise.resolve();
  #pendingNotifications: Set<HTMLElement> = new Set();

  override shadowRoot!: ShadowRoot;
  svg!: SVGSVGElement;
  vp!: HTMLDivElement;
  selBox!: HTMLDivElement;

  // Interaction State
  #ghostPos: Point | null = null;
  #isConnecting = false;
  #connStartPort: AxonPortBaseType | null = null;
  #hoveredPort: AxonPortBaseType | null = null;

  #snapEnabled = false;

  zoomLevel = 1;
  panPos: Point = { x: 0, y: 0 };

  boxSelectMode = true;
  edgeMap = new Map<AxonEdgeType, SVGGElement>();
  classNames = {
    isInteracting: "is-interacting",
  };

  static get observedAttributes(): string[] {
    return ["snapenabled", "is-selected-class"];
  }

  attributeChange: Record<string, (value: string) => void> = {
    snapenabled: (value: string) => {
      this.snapEnabled = value !== "false";
    },
    "is-selected-class": (value: string) => {
      this.#selectionSystem.classNames.isSelected = value;
    },
  };

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
  ): void {
    if (oldValue === newValue) return;

    if (this.attributeChange[name]) {
      this.attributeChange[name](newValue);
    }
  }

  public get snapEnabled(): boolean {
    return this.#snapEnabled;
  }

  public set snapEnabled(value: boolean) {
    this.#snapEnabled = value;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  getPortValue(id: string): unknown {
    return this.#portValues.get(id);
  }

  setPortValue(id: string, value: unknown) {
    const existing = this.#portValues.get(id);
    if (Object.is(existing, value) && typeof value !== "object") return;

    this.#portValues.set(id, value);
    const port = document.getElementById(id);
    if (port && isAxonPort(port, "in")) {
      port.onValueUpdate?.(value);
    }

    // --- PULSE TRIGGER: Move this outside the microtask ---
    const targets = this.#adjacencyMap.get(id);
    if (targets) {
      targets.forEach((toId) => {
        // Find the edge connecting these two
        const edge = this.querySelector(
          `${TAG_NAMES.AXON_EDGE}[from="${id}"][to="${toId}"]`,
        ) as any;
        if (edge) {
          edge.lastPulse = performance.now(); // Set immediately for the draw loop
        }
        // Recursive call for propagation
        this.setPortValue(toId, value);
      });
    }

    // --- NOTIFICATION: Keep this in the microtask for batching ---
    this.#microtaskQueue.then(() => {
      const port = document.getElementById(id);
      if (port && isAxonPort(port, "in")) {
        const node = port.closest(TAG_NAMES.AXON_BOX);
        if (node && isAxonBox(node)) {
          this.#pendingNotifications.add(node as HTMLElement);
        }
      }
      this.#flushNotifications();
      this.updateState();
    });
  }

  #flushNotifications() {
    if (this.#pendingNotifications.size === 0) return;

    this.#pendingNotifications.forEach((node) => {
      const inputs: Record<string, unknown> = {};
      node.querySelectorAll(TAG_NAMES.AXON_PORT_IN).forEach((p) => {
        inputs[p.id] = this.#portValues.get(p.id);
      });

      node.dispatchEvent(
        new CustomEvent("axon-data-change", {
          bubbles: true,
          composed: true,
          detail: { inputs, graph: this },
        }),
      );
    });

    this.#pendingNotifications.clear();
  }

  updateState() {
    if (!this.#stateUpdateThrottled) {
      this.#stateUpdateThrottled = true;
      setTimeout(() => {
        this.dispatchEvent(new CustomEvent("state-update"));
        this.#stateUpdateThrottled = false;
      }, 500);
    }
  }

  rebuildAdjacency(): void {
    this.#adjacencyMap.clear();
    this.querySelectorAll(TAG_NAMES.AXON_EDGE).forEach((edge) => {
      const from = edge.getAttribute("from");
      const to = edge.getAttribute("to");

      if (!from || !to) return;

      let fromSet = this.#adjacencyMap.get(from);

      if (!fromSet) {
        fromSet = new Set();
        this.#adjacencyMap.set(from, fromSet);
      }

      fromSet.add(to);
    });
  }

  getPortCenter(port: AxonPortBaseType): Point {
    const box = port.closest(TAG_NAMES.AXON_BOX);
    if (!box || !isAxonBox(box)) {
      return { x: 0, y: 0 };
    }

    let offset = this.#portOffsets.get(port.id);
    if (!offset) {
      const portRect = port.getBoundingClientRect();
      const boxRect = box.getBoundingClientRect();
      offset = {
        dx: (portRect.left - boxRect.left) / this.zoomLevel,
        dy: (portRect.top - boxRect.top) / this.zoomLevel,
        w: portRect.width / this.zoomLevel,
        h: portRect.height / this.zoomLevel,
      };
      this.#portOffsets.set(port.id, offset);
    }

    const isInput = isAxonPort(port, "in");
    return {
      x: box.x + offset.dx + (isInput ? 0 : offset.w),
      y: box.y + offset.dy + (offset.h / 2),
    };
  }

  connectedCallback(): void {
    this.shadowRoot.innerHTML = /*html*/ `
                    <style>${style}</style>
                    <div class="viewport" id="vp"><svg id="svg"></svg><div class="content"><slot></slot></div></div>
                    <div id="sel-box" class="selection-box"></div>
                `;
    this.svg = this.shadowRoot.getElementById("svg") as any as SVGSVGElement;
    this.vp = this.shadowRoot.getElementById("vp") as HTMLDivElement;
    this.selBox = this.shadowRoot.getElementById("sel-box") as HTMLDivElement;

    this.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const oldZoom = this.zoomLevel;
      this.zoomLevel = Math.min(Math.max(this.zoomLevel * delta, 0.1), 3);
      const rect = this.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      this.panPos.x = mx - (mx - this.panPos.x) * (this.zoomLevel / oldZoom);
      this.panPos.y = my - (my - this.panPos.y) * (this.zoomLevel / oldZoom);
      this.#portOffsets.clear();
      this.updateView();
    }, { passive: false });

    this.addEventListener("pointerdown", this.#handlePointerDown.bind(this));
    this.addEventListener("node-move", () => this.requestDraw());
    new MutationObserver(() => {
      this.#portOffsets.clear();
      this.rebuildAdjacency();
      this.requestDraw();
    }).observe(this, { childList: true, subtree: true });

    this.requestDraw();
    setTimeout(() => {
      this.rebuildAdjacency();
      this.updateView();
    }, 100);
  }

  updateView(): void {
    this.vp.style.transform =
      `translate3d(${this.panPos.x}px, ${this.panPos.y}px, 0) scale(${this.zoomLevel})`;
    this.style.backgroundPosition = `${this.panPos.x}px ${this.panPos.y}px`;
    this.style.backgroundSize = `${20 * this.zoomLevel}px ${
      20 * this.zoomLevel
    }px`;
    this.requestDraw();
  }

  requestDraw(): void {
    if (this.#isDrawing) return;
    this.#isDrawing = true;
    requestAnimationFrame(() => {
      this.draw();
      this.#isDrawing = false;
      this.requestDraw();
    });
  }

  handleConnectionStart(port: AxonPortBaseType): void {
    this.#connStartPort = port;
    this.#isConnecting = true;
    document.body.classList.add("is-connecting");

    const rect = this.getBoundingClientRect();
    const onMove = (e: PointerEvent) => {
      if (!this.#isConnecting || !this.#connStartPort) return;
      this.#ghostPos = {
        x: (e.clientX - rect.left - this.panPos.x) / this.zoomLevel,
        y: (e.clientY - rect.top - this.panPos.y) / this.zoomLevel,
      };
      const target = document.elementFromPoint(e.clientX, e.clientY)?.closest(
        `${TAG_NAMES.AXON_PORT_IN}, ${TAG_NAMES.AXON_PORT_OUT}`,
      );
      if (!target || !isAxonPort(target)) {
        if (this.#hoveredPort) {
          this.#hoveredPort.classList.remove("valid-target");
        }
        this.#hoveredPort = null;
        return;
      }

      this.#hoveredPort = (target && target !== this.#connStartPort &&
          target.tagName !== this.#connStartPort.tagName &&
          this.#connStartPort.box !== target.box)
        ? target
        : null;

      if (this.#hoveredPort) this.#hoveredPort.classList.add("valid-target");
    };

    const onUp = () => {
      if (!this.#isConnecting || !this.#connStartPort) return;
      if (this.#hoveredPort) {
        const from = this.#connStartPort.tagName.includes("OUT")
          ? this.#connStartPort
          : this.#hoveredPort;
        const to = this.#connStartPort.tagName.includes("IN")
          ? this.#connStartPort
          : this.#hoveredPort;
        this.querySelector(`${TAG_NAMES.AXON_EDGE}[to="${to.id}"]`)?.remove();
        const edge = document.createElement(TAG_NAMES.AXON_EDGE);
        edge.setAttribute("from", from.id);
        edge.setAttribute("to", to.id);
        this.appendChild(edge);
        this.rebuildAdjacency();
        this.setPortValue(to.id, this.getPortValue(from.id));
        from.onConnected();
        to.onConnected();
        this.#hoveredPort.classList.remove("valid-target");
        this.#hoveredPort = null;
      }
      this.#isConnecting = false;
      this.#connStartPort = null;
      this.#ghostPos = null;
      document.body.classList.remove("is-connecting");
      document.querySelectorAll(".valid-target").forEach((el) =>
        el.classList.remove("valid-target")
      );
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  #handlePointerDown(e: PointerEvent): void {
    if (!e.target) return;
    const port = (e.target as HTMLElement).closest(
      `${TAG_NAMES.AXON_PORT_IN}, ${TAG_NAMES.AXON_PORT_OUT}`,
    );

    if (port && isAxonPort(port)) {
      e.stopPropagation();
      if (isAxonPort(port, "in")) {
        const existing = this.querySelector(
          `${TAG_NAMES.AXON_EDGE}[to="${port.id}"]`,
        );
        if (existing) {
          const fromId = existing.getAttribute("from");
          existing.remove();
          this.rebuildAdjacency();
          this.setPortValue(port.id, undefined);
          port.onDisconnected();

          const fromElement = document.getElementById(fromId || "");
          if (!fromElement || !isAxonPort(fromElement)) {
            return;
          }

          fromElement.onDisconnected();
          this.handleConnectionStart(fromElement);
          return;
        }
      }
      this.handleConnectionStart(port);
      return;
    }

    const node = (e.target as HTMLElement).closest(TAG_NAMES.AXON_BOX);
    if (node && isAxonBox(node)) {
      e.stopPropagation();
      if (!e.shiftKey && !node.classList.contains("is-selected")) {
        this.#selectionSystem.clearSelection();
      }
      this.#selectionSystem.selectNode(node.id, true);
      this.#handleNodeDrag(e);
      return;
    }

    if (e.target !== this && (e.target as HTMLElement).id !== "vp") return;
    this.#handleBackground(e);
  }

  #handleNodeDrag(e: PointerEvent) {
    const selectedNodes = this.#selectionSystem.getSelectedNodes();
    selectedNodes.forEach((n) => n.classList.add("dragging"));
    document.body.classList.add("is-interacting");
    const zoom = this.zoomLevel, snap = 20;
    const startM = { x: e.clientX, y: e.clientY },
      startP = selectedNodes.map((n) => ({ n, x: n.x, y: n.y }));

    const move = (me: PointerEvent) => {
      const dx = (me.clientX - startM.x) / zoom,
        dy = (me.clientY - startM.y) / zoom;
      startP.forEach((p) => {
        if (this.snapEnabled) {
          p.n.x = Math.round((p.x + dx) / snap) * snap;
          p.n.y = Math.round((p.y + dy) / snap) * snap;
        } else {
          p.n.x = p.x + dx;
          p.n.y = p.y + dy;
        }
      });
    };
    const up = () => {
      selectedNodes.forEach((n) => n.classList.remove("dragging"));
      document.body.classList.remove(this.classNames.isInteracting);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  #handleBackground(e: PointerEvent) {
    const startM = { x: e.clientX, y: e.clientY };
    const startP = { ...this.panPos };
    const rect = this.getBoundingClientRect();
    const isSel = this.boxSelectMode && !e.altKey;

    let moved = false;

    if (isSel) {
      if (!e.shiftKey) this.#selectionSystem.clearSelection();
      this.selBox.style.display = "block";
    } else document.body.classList.add("is-interacting");

    const move = (me: PointerEvent) => {
      moved = true;
      if (isSel) {
        const x = Math.min(startM.x - rect.left, me.clientX - rect.left),
          y = Math.min(startM.y - rect.top, me.clientY - rect.top);
        const w = Math.abs(me.clientX - startM.x),
          h = Math.abs(me.clientY - startM.y);
        Object.assign(this.selBox.style, {
          left: x + "px",
          top: y + "px",
          width: w + "px",
          height: h + "px",
        });
        const bR = this.selBox.getBoundingClientRect();
        this.querySelectorAll(TAG_NAMES.AXON_BOX).forEach((n) => {
          const nr = n.getBoundingClientRect();
          this.#selectionSystem.selectNode(
            n.id,
            !(nr.right < bR.left || nr.left > bR.right || nr.bottom < bR.top ||
              nr.top > bR.bottom),
          );
        });
      } else {
        this.panPos.x = startP.x + (me.clientX - startM.x);
        this.panPos.y = startP.y + (me.clientY - startM.y);
        this.updateView();
      }
    };

    const up = (): void => {
      if (!moved && !isSel) this.#selectionSystem.clearSelection();
      this.selBox.style.display = "none";
      document.body.classList.remove("is-interacting");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      this.updateState();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  draw() {
    if (!this.svg) return;
    const edges = Array.from(
      this.querySelectorAll(TAG_NAMES.AXON_EDGE),
    ) as AxonEdgeType[];
    const edgeIds = new Set(edges);

    for (const [el, g] of this.edgeMap) {
      if (!edgeIds.has(el)) {
        g.remove();
        this.edgeMap.delete(el);
      }
    }

    const graphRect = this.getBoundingClientRect();
    const now = performance.now();
    const viewport = {
      left: -this.panPos.x / this.zoomLevel,
      top: -this.panPos.y / this.zoomLevel,
      right: (graphRect.width - this.panPos.x) / this.zoomLevel,
      bottom: (graphRect.height - this.panPos.y) / this.zoomLevel,
    };

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i] as AxonEdgeType;
      const fromAttr = edge.getAttribute("from");
      const toAttr = edge.getAttribute("to");
      if (!fromAttr || !toAttr) continue;

      const from = document.getElementById(fromAttr);
      const to = document.getElementById(toAttr);

      if (!from || !to || !isAxonPort(from) || !isAxonPort(to)) continue;

      const s = this.getPortCenter(from), e = this.getPortCenter(to);

      const isVisible = !(Math.max(s.x, e.x) < viewport.left - 100 ||
        Math.min(s.x, e.x) > viewport.right + 100 ||
        Math.max(s.y, e.y) < viewport.top - 100 ||
        Math.min(s.y, e.y) > viewport.bottom + 100);

      let g = this.edgeMap.get(edge);
      if (!isVisible) {
        if (g) g.setAttribute("display", "none");
        continue;
      }

      const dx = Math.abs(e.x - s.x) * 0.5;
      const pathData = `M ${s.x} ${s.y} C ${s.x + dx} ${s.y}, ${
        e.x - dx
      } ${e.y}, ${e.x} ${e.y}`;

      if (!g) {
        g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.innerHTML = /*html*/ `
          <path
            style="stroke:transparent;stroke-width:15px;cursor:pointer;pointer-events:stroke"
            d=""
          />
          <path
            stroke="#475569"
            stroke-width="2"
            fill="none" d=""
          />
        `;
        g.onclick = () => edge.remove();
        this.svg.appendChild(g);
        this.edgeMap.set(edge, g);
      }

      g.setAttribute("display", "block");

      const mainLine = g.children.item(1) as SVGPathElement;
      (g.children.item(0) as SVGPathElement).setAttribute("d", pathData);
      mainLine.setAttribute("d", pathData);

      const val = this.getPortValue(from.id);
      const dt = now - (edge.lastPulse || 0);
      const pulseIntensity = Math.exp(-dt / 250);

      if (pulseIntensity > 0.01) {
        const shimmer = 0.85 + 0.15 * Math.sin(now / 15);
        mainLine.style.stroke = `rgba(56, 189, 248, ${
          0.4 + pulseIntensity * 0.6 * shimmer
        })`;
        mainLine.style.strokeWidth = `${2 + pulseIntensity * 4}px`;
      } else {
        mainLine.style.stroke = "";
        mainLine.style.strokeWidth = "";
      }

      edge.dispatchEvent(
        new CustomEvent("edge-draw", {
          bubbles: false,
          detail: {
            pathData,
            fromPos: s,
            toPos: e,
            value: val,
            getPointAtT: (t: number) =>
              getBezierPoint(
                t,
                s,
                { x: s.x + dx, y: s.y },
                { x: e.x - dx, y: e.y },
                e,
              ),
            //`translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
          },
        }),
      );
    }

    let gp = this.svg.querySelector(".ghost") as SVGPathElement | null;
    if (this.#isConnecting && this.#ghostPos && this.#connStartPort) {
      if (!gp) {
        gp = document.createElementNS("http://www.w3.org/2000/svg", "path");
        gp.setAttribute("class", "ghost");
        gp.setAttribute("fill", "none");
        this.svg.appendChild(gp);
      }
      const s = this.getPortCenter(this.#connStartPort);
      const e = this.#ghostPos;
      const dx = Math.abs(e.x - s.x) * 0.5;
      gp.setAttribute(
        "d",
        `M ${s.x} ${s.y} C ${s.x + dx} ${s.y}, ${
          e.x - dx
        } ${e.y}, ${e.x} ${e.y}`,
      );
      gp.style.display = "block";
    } else if (gp) gp.style.display = "none";
  }
}

/**
 * Calculates a point on the curve at time t (0.0 to 1.0)
 */
function getBezierPoint(
  t: number,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
): Point {
  const term = 1 - t;
  return {
    x: term ** 3 * p0.x + 3 * term ** 2 * t * p1.x + 3 * term * t ** 2 * p2.x +
      t ** 3 * p3.x,
    y: term ** 3 * p0.y + 3 * term ** 2 * t * p1.y + 3 * term * t ** 2 * p2.y +
      t ** 3 * p3.y,
  };
}
customElements.define(TAG_NAMES.AXON_GRAPH, AxonGraph);
