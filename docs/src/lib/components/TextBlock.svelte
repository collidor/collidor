<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  let { children }: Props = $props();
</script>

<p
  class="text-slate-600 font-medium mb-10 fade-up border-l-4 border-slate-300/50"
>
  {@render children()}
</p>
