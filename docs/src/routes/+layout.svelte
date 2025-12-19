<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import { page } from "$app/state";
  import "../lib/styles/main.css";
  import Background from "../lib/components/Background.svelte";
  import Menu from "../lib/components/Menu/Menu.svelte";
  import type { LayoutProps } from "./$types";
  import IconList from "../lib/components/icons/IconList.svelte";
  import type { Route } from "../lib/models/route.model";
  import { setRouteContext } from "../lib/contexts/route.context";

  import "highlight.js/styles/atom-one-dark.css";

  let { data, children }: LayoutProps = $props();

  const routes = $derived(() => {
    let activeRoute: Route | null = null;
    const list: Route[] = [];

    for (const route of data.routes) {
      if (route.link === page.route.id) {
        activeRoute = {
          ...route,
          active: true,
        };
        list.push(activeRoute);
        continue;
      } else {
        list.push({
          ...route,
          active: false,
        });
      }
    }

    return {
      list,
      activeRoute,
    };
  });

  setRouteContext(routes);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<IconList />
<Background>
  {#snippet menu()}
    <Menu routes={routes().list} />
  {/snippet}
  {@render children()}
</Background>
