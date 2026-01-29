import { clockNode } from "./clock.node.ts";
import { mathNode } from "./math.node.ts";
import { displayNode } from "./display.node.ts";

export const nodeRegistry = {
  clock: clockNode,
  math: mathNode,
  display: displayNode,
};
