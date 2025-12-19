<script lang="ts">
  import type { Snippet } from "svelte";
  import IconView from "../icons/IconView.svelte";

  type Props = {
    title: string;
    icon?: string;
    children: Snippet;
  };

  let { title, children, icon }: Props = $props();
</script>

<div
  class="prism-glass p-6 mb-4 fade-up relative group transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-300/50"
>
  <div
    class="absolute top-0 right-0 p-2 opacity-30 group-hover:opacity-100 transition-opacity"
  >
    <div
      class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]"
    >
    </div>
  </div>
  <div class="flex items-start justify-between mb-3">
    <h3
      class="text-xl font-bold text-slate-800 flex items-center font-rajdhani"
    >
      {#if icon}
        <div
          class="lucide lucide-activity w-5 h-5 mr-3 text-cyan-600 group-hover:text-cyan-400 transition-colors"
        >
          <IconView name={icon} />
        </div>
      {/if}
      <span>
        {title}
      </span>
    </h3>
    <span
      class="text-[10px] bg-white/50 text-slate-600 border border-slate-200 px-2 py-0.5 uppercase tracking-widest font-bold font-mono shadow-sm"
    >STANDBY</span>
  </div>

  {@render children()}
</div>
