<script lang="ts" module>
export const switchId = (() => {
  let id = 0;
  return function () {
    return `switch-${id++}`;
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
import { ref } from 'vue';

    

const open = ref(true);
const { id = switchId() } = defineProps<{
  id?: string;
}>();

const portOutId = getPortId(id);
const portInId = `${id}-in-0`;
const switchPort = getPortId(id);

</script>

<template>
    <NodeBase>
        <template v-slot:header>
              <PortValue
                :id="switchPort"
                direction="input"
                dataType="any"
                @update="handleUpdate"
            >
            </PortValue>
        <h3>Switch</h3>
        </template>
        <div class="content">
        <label class="switch">
            <input type="checkbox" v-model="open" />
            <span class="slider"></span>
        </label>
        </div>
    </NodeBase>
</template>