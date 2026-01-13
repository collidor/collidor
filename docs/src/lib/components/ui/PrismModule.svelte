<script lang="ts">
  import type { Snippet } from "svelte";
  import IconView from "../icons/IconView.svelte";

  type Props = {
    title: string;
    icon?: string;
    link?: string;
    children: Snippet;
  };

  let { title, children, link, icon }: Props = $props();

  const tag = $derived(() => link ? "a" : "div");
</script>

<svelte:element
  this={tag()}
  href={link}
  class="prism-glass block p-2 mb-4 fade-up relative group transition-all duration-300 shadow-md hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-300/50"
>
  <div
    class="absolute top-0 right-0 p-2 opacity-30 group-hover:opacity-100 transition-opacity"
  >
    <div
      class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]"
    >
    </div>
  </div>
  <h3
    class="font-bold text-slate-800 flex items-center font-rajdhani"
  >
    {#if icon}
      <div
        class="lucide lucide-activity w-5 h-5 mr-3 text-slate-400 group-hover:text-cyan-400 transition-colors"
      >
        <IconView name={icon} />
      </div>
    {/if}
    <span>
      {title}
    </span>
  </h3>

  {@render children()}
</svelte:element>
