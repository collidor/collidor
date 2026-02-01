import sharedStyles from "./shared.node.css?inline";

export const clockNode = {
  name: "Clock",
  category: "Input",
  template: () => /*html*/ `<clock-node></clock-node>`,
};

export class ClockNode extends HTMLElement {
  static idCounter = 0;
  #id: string = `clock_${ClockNode.idCounter++}`;
  #intervalId: number | null = null;

  static observedAttributes = ["value", "min", "max"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  get portOutId() {
    return `${this.#id}_out`;
  }

  connectedCallback() {
    // 1. Setup the Internal UI (Shadow)
    this.renderShadow();

    // 2. Setup the External Ports (Light DOM)
    // This allows the NodeGraph engine to find the port via querySelector
    if (!this.querySelector("node-port-out")) {
      const port = document.createElement("node-port-out");
      port.id = this.portOutId;
      port.setAttribute("slot", "ports");
      port.textContent = "Tick";
      this.appendChild(port);
    }

    this.startClock();
  }

  disconnectedCallback() {
    this.stopClock();
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    const input = this.shadowRoot?.querySelector("input");
    if (input) {
      if (name === "value") input.value = newValue;
      // ... handle min/max
    }
    this.startClock();
  }

  private startClock() {
    this.stopClock();
    const graph = this.closest("node-graph") as any;
    const input = this.shadowRoot?.querySelector("input") as HTMLInputElement;
    if (!graph || !input) return;

    const hz = parseInt(input.value, 10) || 1;
    this.#intervalId = setInterval(() => {
      graph.setPortValue(this.portOutId, Date.now());
    }, 1000 / hz);
  }

  private stopClock() {
    if (this.#intervalId) clearInterval(this.#intervalId);
  }

  private renderShadow() {
    const hzValue = this.getAttribute("value") || 1;

    this.shadowRoot!.innerHTML = /*html*/ `
      <style>
        ${sharedStyles}

        details summary {
          list-style: none;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          user-select: none;
          gap: 8px;
        }

        details summary::-webkit-details-marker { display: none; }

        .toggle-btn {
          background: none;
          border: none;
          color: var(--accent);
          cursor: pointer;
          padding: 8px;
          font-size: 10px;
          transition: transform 0.2s ease;
        }

        details[open] .toggle-btn { transform: rotate(90deg); }

        .header-title {
          color: #fb7185;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          pointer-events: none;
          white-space: nowrap;
        }

        /* The Hertz Value sitting in the middle */
        .status-val {
          flex: 1;
          text-align: right;
          font-family: monospace;
          color: var(--accent);
          font-size: 10px;
          font-weight: bold;
          padding-right: 12px;
          pointer-events: none;
        }

        .header-ports {
          display: flex;
          align-items: center;
        }

        .content { padding: 12px; }
      </style>

      <div class="container">
        <details>
          <summary>
            <button type="button" class="toggle-btn">▶</button>
            <div class="header-title">SYSTEM CLOCK</div>
            <div class="status-val">${hzValue}Hz</div>
            <div class="header-ports">
              <slot name="ports"></slot>
            </div>
          </summary>

          <div class="content">
            <input type="range" min="1" max="60" value="${hzValue}">
          </div>
        </details>
      </div>
    `;

    // Manual toggle logic
    const summary = this.shadowRoot!.querySelector("summary")!;
    const btn = this.shadowRoot!.querySelector(".toggle-btn")!;
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if ((e.target as HTMLElement).closest(".toggle-btn")) {
        const details = this.shadowRoot!.querySelector("details")!;
        details.open = !details.open;
      }
    });

    // Input logic
    const input = this.shadowRoot!.querySelector("input")!;
    input.addEventListener("pointerdown", (e) => e.stopPropagation());
    input.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value;
      this.setAttribute("value", val);

      // Live update the label
      const status = this.shadowRoot!.querySelector(".status-val");
      if (status) status.textContent = `${val}Hz`;

      this.dispatchEvent(
        new CustomEvent("custom-change", {
          detail: { value: val },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }
}
customElements.define("clock-node", ClockNode);
