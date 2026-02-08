<template>
  <div class="port-grid">
    <slot></slot>
  </div>
</template>

<style scoped>
.port-grid {
  display: grid;
  grid-template-columns: minmax(1fr, 0px) minmax(1fr, 0px);
  grid-auto-rows: minmax(30px, auto);
  gap: 8px;
  grid-auto-flow: dense;
}

:slotted(axon-port-in) {
  grid-column: 1;
}

:slotted(axon-port-out) {
  grid-column: 2;
}
</style>
