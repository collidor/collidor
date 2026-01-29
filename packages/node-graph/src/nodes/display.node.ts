export const displayNode = {
  name: "Display",
  category: "Output",
  script: (
    node: HTMLElement,
    _graph: unknown,
    inputs: Record<string, unknown>,
  ) => {
    const val = Object.values(inputs)[0] || 0;
    node.querySelector(".val").textContent = typeof val === "number"
      ? val.toFixed(1)
      : val.toString();
  },
  template: (id: string) => `
    <div slot="header">Display</div>
    <div class="p-4 text-2xl font-bold val">0</div>
    <div slot="ports" class="ports-grid">
      <node-port-in id="${id}_in">In</node-port-in><div></div>
    </div>
  `,
};
