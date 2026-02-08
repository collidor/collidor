<script setup lang="ts">
import { provide, useTemplateRef } from "vue";
import type { AxonGraphType } from "../lib/axon/components/constants";
import ClockNode from "./nodes/ClockNode.vue";
import DisplayNode from "./nodes/DisplayNode.vue";

const graph = useTemplateRef<AxonGraphType>("graph");
provide("graphRef", graph);
</script>

<template>
  <axon-graph id="graph" ref="graph" :snapEnabled="false">
    <slot></slot>
    <ClockNode />
    <DisplayNode />
  </axon-graph>
</template>
