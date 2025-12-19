<script lang="ts">
  import IconView from "../icons/IconView.svelte";
</script>

<div
  class="h-12 bg-white/40 border-t border-white/60 flex items-center px-8 justify-between text-[10px] text-slate-500 font-mono uppercase tracking-widest backdrop-blur-md"
>
  <span class="flex items-center font-bold text-slate-600"><div
      class="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 animate-pulse shadow-[0_0_6px_#22c55e]"
    >
    </div>
    SECURE CONNECTION</span><span
    class="flex items-center gap-6 font-bold"
  ><span>UPTIME: 99.9%</span><span>
      <div class="lucide lucide-lock w-3 h-3 inline-block mr-1 opacity-50">
        <IconView name="lock" />
      </div>
      TLS 1.3</span></span>
</div>
