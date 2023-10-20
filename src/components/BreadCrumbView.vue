<template>
  <div>
    <a-breadcrumb  style="margin: 16px 0">
      <a-breadcrumb-item>
        {{ title }}
      </a-breadcrumb-item>
    </a-breadcrumb>

  </div>
</template>
<script lang="ts" setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const path = router.currentRoute
const title = router.currentRoute.value.meta.title
const routes = router.options.routes;
</script>
