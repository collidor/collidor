<script lang="ts">
  type Props = {
    title?: string;
  };

  let { title }: Props = $props();
</script>

<div class="flex items-center mt-12 mb-8 fade-up">
  <div
    class="w-2 h-2 bg-orange-400 rounded-sm mr-4 shadow-[0_0_8px_#fb923c]"
  >
  </div>
  {#if title}
    <h3
      class="text-slate-800 text-sm font-bold uppercase tracking-[0.2em] font-rajdhani"
    >
      {title}
    </h3>
  {/if}

  <div
    class="h-px flex-1 bg-linear-to-r from-slate-300 to-transparent ml-6"
  >
  </div>
</div>
