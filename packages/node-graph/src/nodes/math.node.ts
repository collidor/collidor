import type { NodeGraph } from "../../components/nodeGraph.component.ts";

export const mathNode = {
  name: "Math",
  category: "Processor",
  script: (
    node: HTMLElement,
    graph: NodeGraph,
    inputs: Record<string, unknown>,
  ) => {
    const val = (Object.values(inputs)[0] || 0) as number + 5;
    node.querySelector(".val").textContent = val.toString();

    // Push result to the output port
    const outPort = node.querySelector("node-port-out");
    graph.setPortValue(outPort.id, val);
  },
  template: (id: string) => `
    <div slot="header" class="text-indigo-400">Processor</div>
    <div class="content">
        <div class="label">Result: <span class="val">0</span></div>
    </div>
    <div slot="ports" class="ports-grid">
        <node-port-in id="${id}_in">Input</node-port-in>
        <node-port-out id="${id}_out">Output</node-port-out>
    </div>
  `,
};
