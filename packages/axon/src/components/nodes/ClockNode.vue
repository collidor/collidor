<script lang="ts" module>
export const clockId = (() => {
  let id = 0;
  return function () {
    return `clock-${id++}`;
  };
})();

export const getPortId = (() => {
  let id = 0;
  return function (nodeId: string) {
    return `${nodeId}-out-${id++}`;
  };
})();
</script>

<script lang="ts" setup>
import {
  effect,
  inject,
  onMounted,
  onUnmounted,
  ref,
  type ShallowRef,
  useTemplateRef,
} from "vue";
import type {
  AxonGraphType,
  AxonPortBaseType,
  AxonPortOutType,
} from "../../lib/axon/components/constants";
import PortGrid from "../partials/PortGrid.vue";
import PortValue from "../partials/PortValue.vue";
import NodeBase from "../partials/NodeBase.vue";
const hzValue = ref(30);
const open = ref(true);

const { id = clockId(), hz = 30, min = 1, max = 60 } = defineProps<{
  id?: string;
  hz?: number;
  min?: number;
  max?: number;
}>();

const portOutId = getPortId(id);
const portInId = `${id}-in-0`;

let intervalId = ref<number | null>(null);

effect(() => {
  hzValue.value = hz;
});

effect(() => {
  if (intervalId.value) {
    startClock();
  } else {
    stopClock();
  }
});

const portOut = ref<AxonPortOutType>();

function startClock() {
  stopClock();

  intervalId.value = setInterval(() => {
    const now = Date.now();
    portOut.value?.setValue(now);
  }, 1000 / hzValue.value);
}

function stopClock() {
  if (intervalId.value) clearInterval(intervalId.value);
}

onMounted(() => {
  startClock();
});

onUnmounted(() => {
  stopClock();
});
</script>

<template>
  <NodeBase :id="id">
    <template v-slot:header>
      <h3>System Clock</h3>
    </template>
    <PortGrid>
      <PortValue
        label=""
        :id="portInId"
        direction="input"
        dataType="number"
        v-slot="{ connected }"
      >
        <div class="port-content">
          <span>Frequency</span>
          <input
            v-if="!connected"
            type="number"
            :min="min"
            :max="max"
            v-model="hzValue"
            @pointerdown.stop
          >
          <span>Hz</span>
        </div>
      </PortValue>
      <PortValue
        :ref="
          (ref: any) => {
            portOut = ref.portRef;
          }
        "
        :id="portOutId"
        direction="output"
        dataType="number"
      >
      </PortValue>
    </PortGrid>
  </NodeBase>
</template>

<style scoped>
input[type="range"] {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: var(--border);
  border-radius: 5px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--panel);
}

details summary {
  list-style: none;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  user-select: none;
  gap: 8px;
}

details summary::-webkit-details-marker {
  display: none;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  padding: 8px;
  font-size: 10px;
  transition: transform 0.2s ease;
}

details[open] .toggle-btn {
  transform: rotate(90deg);
}

.header-title {
  color: #fb7185;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  pointer-events: none;
  white-space: nowrap;
}

/* The Hertz Value sitting in the middle */
.status-val {
  flex: 1;
  text-align: right;
  font-family: monospace;
  color: var(--accent);
  font-size: 10px;
  font-weight: bold;
  padding-right: 12px;
  pointer-events: none;
}

.header-ports {
  display: flex;
  align-items: center;
}

.port-content {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
