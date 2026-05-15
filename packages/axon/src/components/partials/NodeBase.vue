<script lang="ts" module>
export const generateId = (() => {
  let id = 0;
  return function () {
    return `box-${id++}`;
  };
})();
</script>

<script lang="ts" setup>
const { id = generateId() } = defineProps<{
  id?: string;
}>();
</script>

<template>
  <axon-box class="box" :id="id">
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </axon-box>
</template>

<style scoped>
.box {
  position: absolute;
  grid-template-columns: minmax(90px, 1fr);
  background: var(--panel);
  border: 1px solid var(--border);
  color: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  z-index: 10;
  user-select: none;
  touch-action: none;
  will-change: transform;
  display: block;
  contain: layout style;
  min-width: 200px;
}

.header {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #38bdf8; /* Blue accent for display */
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 0.5px;
}
</style>
