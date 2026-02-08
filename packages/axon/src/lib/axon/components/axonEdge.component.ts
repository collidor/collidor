import { AXON_EDGE, type AxonEdgeType, TAG_NAMES } from "./constants.ts";

export class AxonEdge extends HTMLElement implements AxonEdgeType {
  readonly [AXON_EDGE] = true as const;
  lastPulse = 0;
}
customElements.define(TAG_NAMES.AXON_EDGE, AxonEdge);
