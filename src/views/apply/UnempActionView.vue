<template>
  <a-row>
    <a-space>
      <span v-for="item in buttonList">
        <a-tooltip :title="item.text">
          <a-button
            @click="item.action"
            v-if="item.show(props.record)"
            :disabled="item.disabled(props.record)"
            :type="item.type"
            ><Icon :icon="item.icon"
          /></a-button>
        </a-tooltip>
      </span>
    </a-space>
  </a-row>
</template>
<script setup lang="ts">
import { message } from "ant-design-vue";
import api from "@/api";
import { useUserStore } from "@/stores";
import { Icon } from "@/components/Icon";
const userStore = useUserStore();
const userInfo = userStore.userInfo;
const props = defineProps({
  record: {
    type: Object,
    default: {},
  },
});
const emit = defineEmits(["getData"]);
const localGetData = () => {
  emit("getData");
};

const updateParams = async (
  record: any,
  params: any,
  errMsg: string,
  successMsg: string
) => {
  return await api
    .updateUnempVeriData({ id: record.id, ...params })
    .then(() => {
      localGetData();
    })
    .then(() => {
      message.info(successMsg);
    })
    .catch((e) => {
      console.log(e);
      message.info(errMsg);
    });
};

const buttonList = [
  {
    text: "复核",
    icon: "CheckOutlined",
    action: () => {
      return updateParams(
        props.record,
        { status: "1", reviewoperator: userInfo.username },
        "复核失败,请联系管理员",
        "复核成功"
      );
    },
    type: "primary",
    show: (record: any) => {
      return record.status == "0" && record.checkoperator !== userInfo.username;
    },
    disabled: () => false,
  },
  {
    text: "初核",
    icon: "RedoOutlined",
    action: () => {
      return updateParams(
        props.record,
        { status: "0" },
        "加入初核失败,请联系管理员",
        "已加入初核"
      );
    },
    type: "primary",
    show: (record: any) => {
      return record.status == "2";
    },
    disabled: () => false,
  },
  {
    text: "删除",
    icon: "DeleteOutlined",
    action: () => {
      return updateParams(
        props.record,
        { status: "3" },
        "删除失败",
        "删除成功"
      );
    },
    type: "dashed",
    show: () => {
      return true;
    },
    disabled: (record: any) => {
      return record.status == "3";
    },
  },
];
</script>
