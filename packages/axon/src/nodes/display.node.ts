import { baseNode } from "./base.node.ts";

export const displayNode = {
  name: "Display",
  category: "Output",
  onMount: (
    node: HTMLElement,
    _graph: unknown,
    inputs: Record<string, unknown>,
  ) => {
    console.log("Display node script mounted");
  },
  onUpdate(
    node: HTMLElement,
    _graph: unknown,
    inputs: Record<string, unknown>,
  ) {
    console.log("Display node script updated");
    const val = Object.values(inputs)[0] || 0;
    node.querySelector(".val").textContent = typeof val === "number"
      ? val.toFixed(1)
      : val.toString();
  },
  template: (id: string) =>
    baseNode(
      /*html*/ `<div>Display</div>`,
      /*html*/ ` <div class="p-4 text-2xl font-bold val">0</div>`,
      /*html*/ `
      <node-port-in id="${id}_in">In</node-port-in><div></div>
    `,
    ),
};
