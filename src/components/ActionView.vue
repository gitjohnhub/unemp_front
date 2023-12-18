<template>
  <a-space wrap>
    <div v-for="item in buttonList">
      <a-tooltip :title="item.text">
        <a-button
          @click="localButtonAction(item)"
          v-if="item.show(props.record)"
          :disabled="
            item.hasOwnProperty('disabled')
              ? item.disabled(props.record)
              : false
          "
          :type="item.type"
          :style="{
            backgroundColor: item.hasOwnProperty('color') ? item.color : '',
          }"
          ><Icon :icon="item.icon"
        /></a-button>
      </a-tooltip>
    </div>
    <slot name="otherAction"></slot>
  </a-space>
</template>
<script setup lang="ts">
import { message } from "ant-design-vue";
import { Icon } from "@/components/Icon";
const props = defineProps({
  record: {
    type: Object,
    default: {},
  },
  buttonList: {
    type: Array<any>,
    default: [],
  },
  action: {
    type: Function,
    default: () => {},
  },
});
const emit = defineEmits(["getData"]);
const localGetData = () => {
  emit("getData");
};

const localButtonAction = async (item: any) => {
  const params = {
    ...item.params,
    id: props.record.id,
  };

  return await props
    .action(params)
    .then(() => {
      localGetData();
    })
    .then(() => {
      message.info(item.successMsg);
    })
    .catch((e) => {
      console.log(e);
      message.info(item.errMsg);
    });
};
</script>
<style scoped></style>
