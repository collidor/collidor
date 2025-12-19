<script lang="ts">
  let { className, name }: { className?: string; name: string } = $props();
</script>

<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <use xlink:href={`#icon-${name}`} class={className} />
</svg>

<style scoped>
  svg {
    width: 100%;
    height: 100%;
  }
</style>
