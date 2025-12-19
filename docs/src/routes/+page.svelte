<script>
  import Divider from "../lib/components/Divider.svelte";
  import PageFooter from "../lib/components/page/PageFooter.svelte";
  import PageHeader from "../lib/components/page/PageHeader.svelte";
  import PageMain from "../lib/components/page/PageMain.svelte";
  import TextBlock from "../lib/components/TextBlock.svelte";
  import PrismModule from "../lib/components/ui/PrismModule.svelte";
</script>
<PageMain>
  {#snippet title()}
    <PageHeader title="System Overview" />
  {/snippet}
  <div class="max-w-5xl relative z-10">
    <TextBlock>
      Collidor is a group of tools focused in providing type safe command and
      event busses, and extensions to them that:
    </TextBlock>
    <ul class="list-disc pl-6 text-slate-600">
      <li class="py-2">
        Facilitate propagation and enable remote command handling (RCP) in
        different Browser contexts, like iframes, Web Workers and different tabs
        under the same domain.
      </li>
      <li class="py-2">Enable HTTP command execution from client to server</li>
    </ul>
    <Divider title="Primary Modules" />
    <PrismModule
      title="Sync Bus"
      icon="cpu"
    >
      <p
        class="text-slate-600 text-sm font-medium leading-relaxed font-sans"
      >
        Direct mapping execution pipeline. Zero latency.
      </p>
    </PrismModule>
    <PrismModule
      title="Async Bus"
      icon="wifi"
    >
      <p
        class="text-slate-600 text-sm font-medium leading-relaxed font-sans"
      >
        Non-blocking I/O operations and remote handling.
      </p>
    </PrismModule>
    <PrismModule
      title="Observable Bus"
      icon="activity"
    >
      <p
        class="text-slate-600 text-sm font-medium leading-relaxed font-sans"
      >
        Reactive streams for continuous telemetry.
      </p>
    </PrismModule>
  </div>
  {#snippet footer()}
    <PageFooter />
  {/snippet}
</PageMain>
