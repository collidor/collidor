import {
  NODE_EDGE,
  NODE_GRAPH,
  NODE_PORT,
  type NodeBoxType,
  type NodeEdgeType,
  type NodeGraphType,
  type NodePortBaseType,
} from "./constants.ts";

export const isNodeEdge = (el: unknown): el is NodeEdgeType => {
  return typeof el === "object" && el !== null &&
    (el as NodeEdgeType)[NODE_EDGE] === true;
};

export const isNodeGraph = (el: unknown): el is NodeGraphType => {
  return typeof el === "object" && el !== null &&
    (el as NodeGraphType)[NODE_GRAPH] === true;
};

export const isNodePort = (el: unknown): el is NodePortBaseType => {
  return typeof el === "object" && el !== null &&
    (el as NodePortBaseType)[NODE_PORT] !== undefined;
};

export const isNodeBox = (el: unknown): el is NodeBoxType => {
  return typeof el === "object" && el !== null &&
    (el as NodeBoxType).id !== undefined;
};
