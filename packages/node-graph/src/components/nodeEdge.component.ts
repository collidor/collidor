import { customElement } from "lit-element/decorators.js";
import { LitElement } from "lit-element/lit-element.js";
import { NODE_EDGE, type NodeEdgeType, TAG_NAMES } from "./constants.ts";
import { createNodePulseEvent } from "../events/nodeMove.event.ts";

@customElement(TAG_NAMES.NODE_EDGE)
export class NodeEdge extends LitElement implements NodeEdgeType {
  [NODE_EDGE] = true as const;

  override connectedCallback() {
    this.addEventListener(createNodePulseEvent.name, () => {
      this.classList.remove("pulsing");
      void this.offsetWidth;
      this.classList.add("pulsing");
    });
  }
}
