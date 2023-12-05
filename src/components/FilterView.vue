<template>
  <a-card>
    <a-space direction="vertical">
      <slot name="otherFilter"></slot>
      <a-select
        v-model:value="localChosenJiezhen"
        mode="multiple"
        placeholder="选择街镇筛选"
        style="width: 300px"
        :options="jiezhens"
        @change="hanleChangeJiezhen"
      ></a-select>
      <a-input-search
        v-model:value="localSearchValue"
        placeholder="输入姓名/身份证"
        style="width: 200px"
        @search="hanleChangeSearch"
      />
      <slot name="footer"></slot>
      <a-button @click="resetSearch" block>重置搜索条件</a-button>
    </a-space>
  </a-card>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { jiezhens } from "@/types";
const props = defineProps({
  chosenJiezhen: {
    type: Array,
    default: () => [],
  },
  localSearchValue: {
    type: String,
    default: "",
  },
});
const localChosenJiezhen = ref(props.chosenJiezhen.slice());
const localSearchValue = ref(props.localSearchValue);
const resetSearch = () => {
  localChosenJiezhen.value = [];
  localSearchValue.value = "";
  hanleChangeSearch();
  hanleChangeJiezhen();
};
const emit = defineEmits(["jiezhenSelectChange", "hanleChangeSearch"]);
const hanleChangeJiezhen = () => {
  emit("jiezhenSelectChange", localChosenJiezhen.value);
};
const hanleChangeSearch = () => {
  console.log("localSearchValue==>", localSearchValue.value);
  emit("hanleChangeSearch", localSearchValue.value);
};
</script>
