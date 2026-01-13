import { NODE_PORT, type NodePortBaseType } from "./components/constants.ts";

export function isNodePort(el: HTMLElement): el is NodePortBaseType {
  return NODE_PORT in el;
}
