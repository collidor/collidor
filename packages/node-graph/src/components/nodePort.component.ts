import { NODE_PORT, type NodePortBaseType } from "./constants.ts";

export class NodePort extends HTMLElement implements NodePortBaseType {
  [NODE_PORT] = true as const;
}
customElements.define("node-port-in", class extends NodePort {});
customElements.define("node-port-out", class extends NodePort {});