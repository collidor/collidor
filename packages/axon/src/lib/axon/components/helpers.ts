import {
  AXON_EDGE,
  AXON_GRAPH,
  AXON_PORT,
  type AxonBoxType,
  type AxonEdgeType,
  type AxonGraphType,
  type AxonPortBaseType,
} from "./constants.ts";

export const isAxonEdge = (el: unknown): el is AxonEdgeType => {
  return typeof el === "object" && el !== null &&
    (el as AxonEdgeType)[AXON_EDGE] === true;
};

export const isAxonGraph = (el: unknown): el is AxonGraphType => {
  return typeof el === "object" && el !== null &&
    (el as AxonGraphType)[AXON_GRAPH] === true;
};

export const isAxonPort = (
  el: unknown,
  inOut?: "in" | "out",
): el is AxonPortBaseType => {
  return typeof el === "object" && el !== null &&
    (el as AxonPortBaseType)[AXON_PORT] !== undefined &&
    (inOut
      ? (el as AxonPortBaseType).tagName.endsWith(inOut.toUpperCase())
      : true);
};

export const canConnectPorts = (
  portA: AxonPortBaseType,
  portB: AxonPortBaseType,
): boolean => {
  const typePortA = portA.tagName.endsWith("IN") ? "input" : "output";
  const typePortB = portB.tagName.endsWith("IN") ? "input" : "output";

  // Can't connect two inputs or two outputs
  if (typePortA === typePortB) return false;

  const dataTypeA = portA.getAttribute("data-type") ?? null;
  const dataTypeB = portB.getAttribute("data-type") ?? null;

  // Allow connection if any port has no data type
  if (!dataTypeA || !dataTypeB) return true;

  // Both ports have data types, must match
  if (dataTypeA !== dataTypeB) return false;
  return true;
};

export const isAxonBox = (el: unknown): el is AxonBoxType => {
  return typeof el === "object" && el !== null &&
    (el as AxonBoxType).id !== undefined;
};
