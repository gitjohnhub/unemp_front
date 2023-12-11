<template>
  <a-row>
    <a-space>
      <span v-for="item in buttonList">
        <a-tooltip :title="item.text">
          <a-button
            @click="item.action"
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
    .updateYanchangData({ id: record.id, ...params })
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
const statusList = ["已登记", "已审批", "待登记", "已取消", "全部"];
const buttonList = [
  {
    text: "复核",
    icon: "CheckOutlined",
    action: () => {
      return updateParams(
        props.record,
        {
          status: statusList.indexOf("已审批"),
          reviewoperator: userInfo.username,
        },
        "复核失败,请联系管理员",
        "复核成功"
      );
    },
    type: "primary",
    show: (record: any) => {
      // return true;
      return record.status == "0" && record.checkoperator !== userInfo.username;
    },
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
  },
  {
    text: "删除",
    icon: "DeleteOutlined",
    action: () => {
      return updateParams(
        props.record,
        { status: statusList.indexOf("已取消") },
        "删除失败",
        "删除成功"
      );
    },
    type: "primary",
    show: () => {
      return true;
    },
    disabled: (record: any) => {
      return record.status == "3";
    },
    color: "brown",
  },
  {
    text: "标记错登记",
    icon: "WarningFilled",
    action: () => {
      return updateParams(
        props.record,
        { wrongTag: "1" },
        "错误,请联系管理员",
        "标记成功"
      );
    },
    type: "primary",
    show: () => true,
    color: "#c21d03",
  },
  {
    text: "收到原件",
    icon: "FilePdfFilled",
    action: () => {
      return updateParams(
        props.record,
        { originalFile: "1" },
        "错误,请联系管理员",
        "标记成功"
      );
    },
    type: "primary",
    show: () => true,
    color: "#fd5732",
  },
];
</script>
<style scoped></style>
