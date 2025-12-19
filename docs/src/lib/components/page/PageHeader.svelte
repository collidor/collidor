<script lang="ts">
  import IconView from "../icons/IconView.svelte";

  type Props = {
    title: string;
    packageText?: string;
  };

  let { title, packageText }: Props = $props();
</script>

<header
  class="p-10 border-b border-white/50 flex justify-between items-end bg-white/20 relative"
>
  <div
    class="absolute top-0 right-0 w-64 h-full bg-linear-to-l from-cyan-50/50 to-transparent pointer-events-none"
  >
  </div>
  <div class="relative z-10">
    <div class="flex">
      {#if packageText}
        <div
          class="text-cyan-600 font-mono text-xs uppercase tracking-[0.2em] mb-2 font-bold flex items-center glow-text-cyan"
        >
          <div class="lucide w-4 h-4 mr-2">
            <IconView name="terminal-square" />
          </div>
          {packageText}
        </div>
      {/if}
    </div>
    <h2
      class="text-5xl font-bold text-slate-800 tracking-tight drop-shadow-sm"
    >
      {title}
    </h2>
  </div>
  <div class="hidden md:block relative z-10">
    <div
      class="text-6xl font-rajdhani font-bold text-slate-300 opacity-50"
    >
      01
    </div>
  </div>
</header>
