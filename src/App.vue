<script setup lang="ts">
   import Header from './components/Header.vue';
</script>

<template>
  <div>
    <Header />
    <router-view /> <!-- This is where matched components will render -->
  </div>
</template>


