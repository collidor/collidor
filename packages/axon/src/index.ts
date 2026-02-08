import { nodeRegistry } from "./nodes/nodeRegistry.ts";
import type { AxonGraph } from "./lib/axon/components/axonGraph.component.ts";

export * from "./lib/axon/components/axonBox.component.ts";
export * from "./lib/axon/components/axonGraph.component.ts";
export * from "./lib/axon/components/axonPort.component.ts";
export * from "./lib/axon/components/axonEdge.component.ts";
export * from "./lib/axon/components/constants.ts";
export * from "./events/nodeMove.event.ts";

document.addEventListener("axon-data-change", (e) => {
  const node = e.target as HTMLElement;
  const { inputs, graph } = (e as CustomEvent).detail;
  const type = node.dataset.type;

  if (type && nodeRegistry[type] && nodeRegistry[type].onUpdate) {
    nodeRegistry[type].onUpdate(node, graph, inputs);
  }
});

// Helper to spawn nodes dynamically
window.spawnNode = (type: string) => {
  const graph = document.querySelector("axon-graph") as NodeGraph;
  const id = "n_" + Math.random().toString(36).substr(2, 5);
  const node = document.createElement("axon-box");
  node.id = id;
  node.dataset.type = type;

  if (type && nodeRegistry[type] && nodeRegistry[type].template) {
    node.innerHTML = nodeRegistry[type].template(id);
    graph.appendChild(node);
    if (nodeRegistry[type].onMount) {
      nodeRegistry[type].onMount(node, graph);
    }
  }
};
