<template>
  <a-space direction="vertical">
    <a-input-group compact>
      <a-input
        v-model:value="startDate"
        type="number"
        style="width: 100px; text-align: center"
        placeholder="开始"
      />
      <a-input
        v-model:value="endDate"
        type="number"
        style="width: 200px; text-align: center"
        placeholder="结束"
      />
      <a-input
        v-model:value="customAddNum"
        type="number"
        style="width: 300px; text-align: center"
        addon-before="自定义增加："
        :addon-after="diffDate"
      />
    </a-input-group>
    <a-space>

</a-space>

  </a-space>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
const startDate = ref<number>(0);
const endDate = ref<number>(0);
const customAddNum = ref<number>(7);
const diffDate = computed(() => getDiff());
// 获得时间间隔的月数，默认+7个月
function getDiff() {
  const months = Number(customAddNum.value) + Number(endDate.value) - Number(startDate.value);
  const years = Math.floor(months / 12);
  const leftMonths = months % 12;
  return `${years}年${leftMonths}个月`;
}


</script>
