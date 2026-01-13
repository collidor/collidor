export const NODE_PORT = Symbol("NODE_PORT");
export const NODE_EDGE = Symbol("NODE_EDGE");
export const NODE_BOX = Symbol("NODE_BOX");
export const NODE_GRAPH = Symbol("NODE_GRAPH");

export const TAG_NAMES = {
  NODE_PORT_IN: "node-port-in",
  NODE_PORT_OUT: "node-port-out",
  NODE_EDGE: "node-edge",
  NODE_BOX: "node-box",
  NODE_GRAPH: "node-graph",
} as const;

export const classList = {
  selected: "selected",
  dragging: "dragging",
  validTarget: "valid-target",
  isInteracting: "is-interacting",
} as const;

export type NodeGraphType = HTMLElement & {
  [NODE_GRAPH]: true;
  zoomLevel: number;
  panPos: { x: number; y: number };
  snapEnabled: boolean;
  gridSize: number;
  handleConnectionStart(port: HTMLElement | null): void;
  clearSelection(): void;
};

export type NodePortBaseType = HTMLElement & {
  [NODE_PORT]: true;
  value: unknown;
  getCenter(): Point;
};
export type NodeEdgeType = HTMLElement & {
  [NODE_EDGE]: true;
};
export type NodeBoxType = HTMLElement & {
  [NODE_BOX]: true;
  x: number;
  y: number;
  selected: boolean;
};

export interface Point {
  x: number;
  y: number;
}
