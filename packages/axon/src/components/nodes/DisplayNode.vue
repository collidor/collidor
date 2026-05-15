<script lang="ts" module>
export const generateId = (() => {
  let id = 0;
  return function () {
    return `display-${id++}`;
  };
})();
</script>

<script lang="ts" setup>
import { ref } from "vue";
import PortValue from "../partials/PortValue.vue";
import NodeBase from "../partials/NodeBase.vue";

const { id = generateId() } = defineProps<{
  id?: string;
}>();

const portInId = `${id}-in-0`;
const displayValue = ref<any>("---");

// Captures the 'update' emit from PortValue.vue
function handleUpdate(val: any) {
  displayValue.value = val;
}
</script>

<template>
  <NodeBase :id="id">
    <template v-slot:header>
      <PortValue
        :id="portInId"
        direction="input"
        dataType="any"
        @update="handleUpdate"
      >
      </PortValue>
      <h3>Data Monitor</h3>
    </template>
    <div class="display-container">
      <div class="screen">
        <code class="output-text">{{ String(displayValue) }}</code>
      </div>
    </div>
  </NodeBase>
</template>

<style scoped>
axon-box {
  display: block;
  contain: layout style;
  min-width: 200px;
}

.status-val {
  flex: 1;
  text-align: right;
  font-family: monospace;
  color: var(--accent);
  font-size: 10px;
  opacity: 0.6;
}

.display-container {
  padding: 8px;
}

.screen {
  background: #000000;
  border: 1px solid var(--border);
  border-radius: 4px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
}

.output-text {
  font-family: "Monaco", "Consolas", monospace;
  font-size: 13px;
  color: #4caf50; /* Green terminal look */
  word-break: break-all;
  text-align: center;
}

.port-label {
  font-size: 9px;
  text-transform: uppercase;
  opacity: 0.4;
  margin-left: 4px;
}
</style>
