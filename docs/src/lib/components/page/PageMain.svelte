<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    title?: Snippet;
    children?: Snippet;
    footer?: Snippet;
  };

  let { title, children, footer }: Props = $props();
</script>
<main class="flex-1 relative flex flex-col z-10">
  <div
    class="prism-glass h-full flex flex-col rounded-2xl relative overflow-hidden chamfer-clip"
  >
    {#if title}
      {@render title()}
    {/if}

    <div class="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
      <div
        class="tech-grid absolute inset-0 opacity-30 pointer-events-none"
      >
      </div>
      <div class="max-w-5xl relative z-10">
        {#if children}
          {@render children()}
        {/if}
      </div>
    </div>
    {#if footer}
      {@render footer()}
    {/if}
  </div>
</main>
