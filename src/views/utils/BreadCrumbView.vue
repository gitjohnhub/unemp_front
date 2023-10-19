<template>
  <div>
    <a-breadcrumb  style="margin: 16px 0">
      <a-breadcrumb-item v-for="route in routes" :key="route.path">
        {{ route.meta!.title }}
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>
<script lang="ts" setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const routes = router.options.routes;
</script>
