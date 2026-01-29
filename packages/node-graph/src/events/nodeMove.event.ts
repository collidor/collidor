export const createNodeMoveEvent = (
  eventInitDict: CustomEventInit = { bubbles: true },
) => new CustomEvent("node-move", eventInitDict);

export const createNodeMoveEndEvent = (
  eventInitDict: CustomEventInit = { bubbles: true },
) => new CustomEvent("node-move-end", eventInitDict);

export const createNodeUpdateEvent = (
  eventInitDict: CustomEventInit = { bubbles: true },
) => new CustomEvent("node-update", eventInitDict);

export const createNodePulseEvent = (
  eventInitDict: CustomEventInit = { bubbles: true },
) => new CustomEvent("pulse", eventInitDict);
