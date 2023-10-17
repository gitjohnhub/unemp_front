<script setup lang="ts">
import { theme } from 'ant-design-vue';
import NavView from './views/NavView.vue';
</script>

<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#00b96b',
      },
    }"
  >
  <NavView />
  </a-config-provider>


</template>
