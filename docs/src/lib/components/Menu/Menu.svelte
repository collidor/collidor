<script lang="ts">
  import Logo from "../Logo.svelte";

  import versions from "../../../versions.json" with { type: "json" };
  import type { Route } from "../../models/route.model";
  import IconView from "../icons/IconView.svelte";
  import { twMerge } from "tailwind-merge";
  import MenuItem from "./MenuItem.svelte";

  let { routes }: {
    routes: Route[];
  } = $props();
</script>

<div class="p-8 pb-6 border-b border-white/50 relative">
  <div
    class="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-orange-100/50 to-transparent pointer-events-none"
  >
  </div>
  <a
    class="text-5xl mb-1 tracking-tight drop-shadow-sm"
    href="/"
  >
    <Logo />
  </a>
  <div class="flex items-center gap-2 mt-2">
    <span
      class="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold tracking-widest border border-green-200 rounded"
    >V{versions.toolkit}</span><span
      class="text-[10px] text-slate-400 font-mono"
    >TOOLKIT</span>
  </div>
</div>
<div class="flex-1 p-6 overflow-y-auto">
  <div class="mb-6">
    <div
      class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 pl-1 flex items-center gap-2"
    >
      <div
        class="lucide lucide-layers w-3 h-3"
      >
        <IconView
          name="layers"
        />
      </div>
      Core Systems
    </div>
    {#each routes as route}
      <MenuItem
        {route}
      />
    {/each}
  </div>
</div>
<div
  class="h-10 bg-white/30 border-t border-white/50 flex items-center px-6 justify-between backdrop-blur-md"
>
  <div class="flex gap-2">
    <div class="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
    <div class="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
    <div class="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
  </div>
  <span class="text-[10px] font-mono text-slate-400">ID: 8842-A</span>
</div>
