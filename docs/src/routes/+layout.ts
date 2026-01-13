import type { Route } from "../lib/models/route.model.ts";
import versions from "../versions.json" with { type: "json" };

const mainRoutes = import.meta.glob("./*/+page.svelte");

const routeRegex = /^\.\/(?<name>[^/]+)\/.*/;

let activeRoute: Route | null = null;

const routes = (await Promise.all(
  Object.keys(mainRoutes).reduce((acc, route): Promise<Route>[] => {
    const name = routeRegex.exec(route)?.groups?.name;
    if (!name) {
      return acc;
    }
    const link = `/${name}`;
    acc.push(
      mainRoutes[route]().then((r: unknown): Route => {
        if (typeof r !== "object" || r === null) {
          return {
            name,
            link,
            title: name.slice(0, 1).toUpperCase() + name.slice(1),
            order: 0,
          };
        }
        const title = "title" in r &&
            typeof r["title"] === "string" && r["title"]
          ? r.title
          : name.slice(0, 1).toUpperCase() + name.slice(1);

        const order = "order" in r &&
            typeof r["order"] === "number" && r["order"]
          ? r.order
          : 0;

        return {
          name,
          link,
          title,
          order,
        };
      }),
    );
    return acc;
  }, []),
)).sort((a, b) => a.order - b.order);

export const load = () => {
  return {
    routes,
    versions,
  };
};

export const prerender = true;
