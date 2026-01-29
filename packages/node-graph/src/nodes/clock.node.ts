import type { NodeGraph } from "../../components/nodeGraph.component.ts";

export const clockNode = {
  name: "Clock",
  category: "Input",
  script: (node: HTMLElement, graph: NodeGraph) => {
    node.querySelector("input").addEventListener("pointerdown", (e) => {
      e.stopPropagation();
    });

    let intervalId = setInterval(() => {
      const out = node.querySelector("node-port-out").id;
      graph.setPortValue(out, Date.now());
    }, 1000);

    const speedInput = node.querySelector(".speed") as HTMLInputElement;
    speedInput.addEventListener("input", () => {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        const out = node.querySelector("node-port-out").id;
        graph.setPortValue(out, Date.now());
      }, 1000 / parseInt(speedInput.value, 10));
    });
  },
  template: (id: string) => `
    <div slot="header">Clock</div>
    <div class="p-3"><input type="range" class="speed" min="1" max="10" value="1"></div>
    <div slot="ports" class="ports-grid">
      <div></div><node-port-out id="${id}_out">Tick</node-port-out>
    </div>
  `,
};
