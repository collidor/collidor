export const AXON_PORT = Symbol("AXON_PORT");
export const AXON_EDGE = Symbol("AXON_EDGE");
export const AXON_BOX = Symbol("AXON_BOX");
export const AXON_GRAPH = Symbol("AXON_GRAPH");

export type TagNames = Record<keyof typeof TAG_NAMES, string>;
export const TAG_NAMES = {
  AXON_PORT_IN: "axon-port-in",
  AXON_PORT_OUT: "axon-port-out",
  AXON_EDGE: "axon-edge",
  AXON_BOX: "axon-box",
  AXON_GRAPH: "axon-graph",
} as const;

export const classList = {
  selected: "selected",
  dragging: "dragging",
  validTarget: "valid-target",
  isInteracting: "is-interacting",
} as const;

export const types = [
  "number",
  "string",
  "boolean",
  "object",
  "array",
  "any",
] as const;
export type PortDataType = typeof types[number];

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

export type AxonGraphType = HTMLElement & {
  [AXON_GRAPH]: true;

  getPortValue(id: string): unknown;
  rebuildAdjacency(): void;
  setPortValue(id: string, value: unknown): void;
  updateState(): void;
  getPortCenter(port: AxonPortBaseType): Point;
};

export type AxonPortBaseType = HTMLElement & {
  [AXON_PORT]: true;
  box: AxonBoxType;
  onConnected(): void;
  onDisconnected(): void;
  onValueUpdate?(value: unknown): void;
};
export type AxonEdgeType = HTMLElement & {
  [AXON_EDGE]: true;
  lastPulse: number;
};
export type AxonBoxType = HTMLElement & {
  [AXON_BOX]: true;
  x: number;
  y: number;
  update(): void;
  lastRenderedValue: unknown;
};
