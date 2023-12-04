<template>
  <a-button
    @click="updateStatus(params, getData, table)"
    type="primary"
    v-if="params.status == '0'"
  >
    <CheckOutlined />
  </a-button>
</template>
<script setup lang="ts">
import api from "@/api";
import { CheckOutlined } from "@ant-design/icons-vue";
const props = defineProps({
  params: {
    type: Object,
    default: {},
  },
  getData: {
    type: Function,
    default: () => {},
  },
  table: {
    type: String,
    default: "",
  },
});
const updateStatus = async (params?: any, callBack?: any, table?: string) => {
  switch (table) {
    case "apply":
      await api.updateUnempVeriData(params).then((res: any) => {
        callBack();
      });
      break;
    case "yanchang":
      await api.updateYanchangData(params).then((res: any) => {
        callBack();
      });
      break;
    case "nongbu":
      await api.updateNongbuData(params).then((res: any) => {
        callBack();
      });
      break;
    default:
      callBack();
  }
};
</script>
