<template>
  <router-view />
</template>

<script lang="ts">
export default {
  name: 'App'
}
</script>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
}

#app {
  width: 100%;
}
</style>
