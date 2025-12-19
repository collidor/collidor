<script lang="ts" module>
  export const title = "Toolkit";
  export const order = 0;
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import Divider from "../../lib/components/Divider.svelte";

  import PageFooter from "../../lib/components/page/PageFooter.svelte";

  import PageHeader from "../../lib/components/page/PageHeader.svelte";

  import PageMain from "../../lib/components/page/PageMain.svelte";
  import TextBlock from "../../lib/components/TextBlock.svelte";
  import versions from "../../versions.json" with { type: "json" };
  import hljs from "highlight.js";
  import { basicCommandBusExample } from "../../lib/examples/commandBus/basic";

  onMount(() => {
    hljs.highlightAll();
  });
</script>

<PageMain>
  {#snippet title()}
    <PageHeader
      title="Toolkit"
      packageText={`@collidor/toolkit @${versions.toolkit}`}
    />
  {/snippet}
  <TextBlock>
    Collidor Toolkit is the umbrela package that groups all tools in a single
    place. It's the recommended way use the available tools.
  </TextBlock>
  <Divider title="Instalation" />
  <pre><code class="language-bash">npm install @collidor/toolkit</code></pre>
  <Divider title="Usage" />
  Import the desired packages and use in your application. For example, the
  <a href="/command">Commmand</a> package:

  <pre>
    <code class="language-typescript">{basicCommandBusExample}</code>

  </pre>
  {#snippet footer()}
    <PageFooter />
  {/snippet}
</PageMain>
