<template>
  <div>
    <h1  style="margin: 16px 0">
        {{ title }}
    </h1>

  </div>
</template>
<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { computed } from 'vue';
const router = useRouter();
const path = router.currentRoute
const title = computed(()=>router.currentRoute.value.meta.title)
const routes = router.options.routes;
</script>
