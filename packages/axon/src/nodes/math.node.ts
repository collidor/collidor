import type { NodeGraph } from "../components/nodeGraph.component.ts";
import { baseNode } from "./base.node.ts";

export const mathNode = {
  name: "Math",
  category: "Processor",
  onUpdate: (
    node: HTMLElement,
    graph: NodeGraph,
    inputs: Record<string, unknown>,
  ) => {
    const val = (Object.values(inputs)[0] || 0) as number + 5;
    document.querySelector(".val").textContent = val.toString();

    // Push result to the output port
    const outPort = document.getElementById(`${node.id}_out`);
    graph.setPortValue(outPort.id, val);
  },
  template: (id: string) =>
    baseNode(
      /*html*/ `<div class="text-indigo-400">Processor</div>`,
      /*html*/ `<div class="content">
        <div class="label">Result: <span class="val">0</span></div>
    </div>`,
      /*html*/ `
        <axon-port-in id="${id}_in">Input</axon-port-in>
        <axon-port-out id="${id}_out">Output</axon-port-out>
    `,
    ),
};
