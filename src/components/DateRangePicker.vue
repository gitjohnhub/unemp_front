<template>
  <a-date-picker v-model:value="monthSelect" picker="month" />
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { DatePicker } from "ant-design-vue";
import { Dayjs } from "dayjs";
const monthSelect = ref<Dayjs>();
const monthRange = computed(() => {
  const firstDay = monthSelect.value.startOf("month").format("YYYY-MM-DD");
  const lastDay = monthSelect.value.endOf("month").format("YYYY-MM-DD");
  console.log(firstDay);
  return [firstDay, lastDay];
});
defineExpose({
  monthSelect,
  monthRange,
});
</script>
