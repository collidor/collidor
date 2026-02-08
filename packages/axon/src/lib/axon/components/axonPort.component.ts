import {
  AXON_PORT,
  type AxonBoxType,
  type AxonPortBaseType,
} from "./constants.ts";

export class AxonPort extends HTMLElement implements AxonPortBaseType {
  [AXON_PORT] = true as const;

  box!: AxonBoxType;

  connectedCallback() {
    this.box = this.closest("axon-box") as AxonBoxType;
  }

  onConnected() {
    this.dispatchEvent(new CustomEvent("port-connected", { bubbles: true }));
  }
  onDisconnected() {
    this.dispatchEvent(new CustomEvent("port-disconnected", { bubbles: true }));
  }
}
customElements.define(
  "axon-port-in",
  class extends AxonPort {
    onValueUpdate(value: unknown) {
      this.dispatchEvent(
        new CustomEvent("value-update", { detail: value, bubbles: true }),
      );
    }
  },
);
customElements.define("axon-port-out", class extends AxonPort {});
