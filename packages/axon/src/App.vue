<script lang="ts" setup>
import Graph from "./components/Graph.vue";
</script>

<template>
  <header>
    <button onclick="spawnNode('clock')">Add Clock</button>
    <button onclick="spawnNode('math')">Add Math (+5)</button>
    <button onclick="spawnNode('display')">Add Display</button>
  </header>

  <Graph> </Graph>
</template>
