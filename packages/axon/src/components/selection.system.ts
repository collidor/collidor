import type { NodeBoxType } from "./constants.ts";
import { isNodeBox } from "./helpers.ts";

export class SelectionSystem {
  #selectedIds: Set<string> = new Set();
  classNames = {
    isSelected: "is-selected",
  };

  selectNode(id: string, isSelected: boolean): void {
    const node = document.getElementById(id);
    if (isSelected) {
      this.#selectedIds.add(id);
      node?.classList.add(this.classNames.isSelected);
    } else {
      this.#selectedIds.delete(id);
      node?.classList.remove(this.classNames.isSelected);
    }
  }

  clearSelection() {
    this.#selectedIds.forEach((id) =>
      document.getElementById(id)?.classList.remove(this.classNames.isSelected)
    );
    this.#selectedIds.clear();
  }

  getSelectedNodes(): NodeBoxType[] {
    return Array.from(this.#selectedIds).reduce((acc, id) => {
      const node = document.getElementById(id);
      if (node && isNodeBox(node)) acc.push(node);
      return acc;
    }, [] as NodeBoxType[]);
  }
}
