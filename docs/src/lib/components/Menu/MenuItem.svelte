<script lang="ts">
  import { twMerge } from "tailwind-merge";
  import type { Route } from "../../models/route.model";
  import IconView from "../icons/IconView.svelte";

  type Props = {
    route: Route;
  };

  let { route }: Props = $props();
</script>

<a
  class={twMerge(
    `
          w-full flex items-center p-4 mb-3 transition-all duration-300 chamfer-btn group relative cursor-pointer
          bg-white/20 border border-transparent text-slate-500 hover:bg-white/40 hover:text-slate-800 hover:border-white
        `,
    route.active &&
      "bg-white/80 border border-orange-400 text-slate-900 shadow-[0_0_20px_rgba(249,115,22,0.3)] translate-x-2",
  )}
  href={route.link}
>
  <div
    class={twMerge(
      "lucide lucide-cpu w-5 h-5 mr-3 z-10 transition-colors text-slate-400 group-hover:text-slate-600",
      route.active &&
        "lucide lucide-layout-grid w-5 h-5 mr-3 z-10 transition-colors text-orange-500",
    )}
  >
    <IconView
      name="layout-grid"
    />
  </div>

  <span
    class="font-bold tracking-widest uppercase text-sm font-rajdhani z-10"
  >
    {route.title}
  </span>

  {#if route.active}
    <div
      class="absolute right-0 top-0 bottom-0 w-1 bg-orange-500"
    >
    </div>
  {/if}
</a>
