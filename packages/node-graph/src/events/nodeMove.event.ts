export const createNodeMoveEvent = (
  eventInitDict: CustomEventInit = { bubbles: true },
) => new CustomEvent("node-move", eventInitDict);
createNodeMoveEvent.name = "node-move";

export const createNodeMoveEndEvent = (
  eventInitDict: CustomEventInit = { bubbles: true },
) => new CustomEvent("node-move-end", eventInitDict);
createNodeMoveEndEvent.name = "node-move-end";

export const createNodeUpdateEvent = (
  eventInitDict: CustomEventInit = { bubbles: true },
) => new CustomEvent("node-update", eventInitDict);
createNodeUpdateEvent.name = "node-update";

export const createNodePulseEvent = (
  eventInitDict: CustomEventInit = { bubbles: true },
) => new CustomEvent("pulse", eventInitDict);
createNodePulseEvent.name = "pulse";
