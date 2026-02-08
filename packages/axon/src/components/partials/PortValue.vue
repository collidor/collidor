<script type="module" lang="ts">
const colors = {
  number: "#4CAF50",
  string: "#2196F3",
  boolean: "#FF9800",
  object: "#9C27B0",
  array: "#E91E63",
  any: "#607D8B",
} as const;
</script>

<script lang="ts" setup>
import type { PortDataType } from "../../lib/axon/components/constants";
import { computed, ref } from "vue";

const { id, direction = "input", dataType = "number" } = defineProps<{
  id: string;
  direction?: "input" | "output";
  dataType: PortDataType;
}>();

const isConnected = ref(false);

const emit = defineEmits<{
  (e: "update", value: unknown): void;
  (e: "connected"): void;
  (e: "disconnected"): void;
}>();

const onConnected = () => {
  isConnected.value = true;
  emit("connected");
};

const onDisconnected = () => {
  isConnected.value = false;
  emit("disconnected");
};

const tag = computed(() => {
  return direction === "input" ? "axon-port-in" : "axon-port-out";
});
</script>

<template>
  <component
    :is="tag"
    :id="id"
    :style='{ "--port-color": colors[dataType] }'
    class="port"
    @port-connected="onConnected"
    @port-disconnected="onDisconnected"
    @value-update='emit("update", $event.detail)'
    :data-type="dataType"
  >
    <slot v-if="!isConnected" :connected="isConnected"></slot>
  </component>
</template>

<style scoped>
.port {
  display: flex;
  gap: 8px;
}
</style>
