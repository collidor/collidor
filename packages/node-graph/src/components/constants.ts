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

export type Point = {
  x: number;
  y: number;
};

export type Offset = {
  dx: number;
  dy: number;
  w: number;
  h: number;
};

export type NodeGraphType = HTMLElement & {
  [NODE_GRAPH]: true;

  getPortValue(id: string): unknown;
  rebuildAdjacency(): void;
  setPortValue(id: string, value: unknown): void;
  updateState(): void;
  getPortCenter(port: NodePortBaseType): Point;
};

export type NodePortBaseType = HTMLElement & {
  [NODE_PORT]: true;
};
export type NodeEdgeType = HTMLElement & {
  [NODE_EDGE]: true;
  lastPulse: number;
};
export type NodeBoxType = HTMLElement & {
  [NODE_BOX]: true;
  x: number;
  y: number;
  update(): void;
  lastRenderedValue: unknown;
};
