<script lang="ts">
  import type { Snippet } from "svelte";

    	let { children, menu } = $props<{
            children: Snippet;
            menu: Snippet;
        }>();
</script>

<div class="relative w-screen h-screen overflow-hidden text-slate-800">
  <div class="absolute inset-0 z-0">
    <!-- <canvas
      width="854"
      height="732"
      style="display: block; width: 854px; height: 732px;"
    ></canvas> -->
  </div>
  <div class="absolute inset-0 pointer-events-none z-10">
    <div
      class="absolute top-8 left-8 w-64 h-px bg-linear-to-r from-slate-400/50 to-transparent"
    ></div>
    <div
      class="absolute top-8 left-8 w-px h-32 bg-linear-to-b from-slate-400/50 to-transparent"
    ></div>
    <div
      class="absolute bottom-8 right-8 w-64 h-px bg-linear-to-l from-slate-400/50 to-transparent"
    ></div>
    <div
      class="absolute bottom-8 right-8 w-px h-32 bg-linear-to-t from-slate-400/50 to-transparent"
    ></div>
  </div>
  <div
    class="absolute inset-0 z-20 flex flex-col md:flex-row p-4 md:p-12 gap-8"
  >
      <aside class="w-full md:w-80 flex flex-col relative z-20">
      <div
        class="prism-glass h-full flex flex-col rounded-2xl relative overflow-hidden chamfer-clip shadow-[0_20px_40px_rgba(0,0,0,0.05)]"
      >
        {@render menu()}
            </div>
    </aside>
    {@render children()}
  </div>
</div>