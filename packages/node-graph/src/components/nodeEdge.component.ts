import { NODE_EDGE, type NodeEdgeType, TAG_NAMES } from "./constants.ts";

export class NodeEdge extends HTMLElement implements NodeEdgeType {
  readonly [NODE_EDGE] = true as const;
  lastPulse = 0;
}
customElements.define(TAG_NAMES.NODE_EDGE, NodeEdge);
