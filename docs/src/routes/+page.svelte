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
      At it's core Collidor is mainly two things: an Command Bus and an Event
      Bus implementations focused on type safety, performance and usability.
    </TextBlock>
    <PrismModule
      title="Event Bus"
      icon="cpu"
      link="/event"
    >
      <p
        class="text-slate-600 text-sm font-medium leading-relaxed font-sans"
      >
        Dependency free, type safe and easy to use command implementation
      </p>
    </PrismModule>
    <PrismModule
      title="Command Bus"
      icon="cpu"
      link="/command"
    >
      <p
        class="text-slate-600 text-sm font-medium leading-relaxed font-sans"
      >
        Dependency free, type safe and easy to use command implementation
      </p>
    </PrismModule>
    <PrismModule
      title="Async Command Bus"
      icon="wifi"
      link="/command"
    >
      <p
        class="text-slate-600 text-sm font-medium leading-relaxed font-sans"
      >
        Promise based command handling.
      </p>
    </PrismModule>
    <PrismModule
      title="Observable Command Bus"
      icon="wifi"
      link="/command"
    >
      <p
        class="text-slate-600 text-sm font-medium leading-relaxed font-sans"
      >
        RXJS based command handling.
      </p>
    </PrismModule>
    <TextBlock>
      On top of that, many plugins and extensions were built:
    </TextBlock>
    <Divider title="Primary Modules" />
    <PrismModule
      title="PortChannel Plugin"
      link="/command"
    >
      <p
        class="text-slate-600 text-sm font-medium leading-relaxed font-sans"
      >
        RXJS based command handling.
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
