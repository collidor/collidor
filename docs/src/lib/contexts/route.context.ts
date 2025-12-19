import { createContext } from "svelte";
import type { Route } from "../models/route.model.ts";

export const [geRouteContext, setRouteContext] = createContext<
  () => {
    list: Route[];
    activeRoute: Route | null;
  }
>();
