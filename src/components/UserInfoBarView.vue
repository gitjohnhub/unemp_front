<template>
  <div class="components-page-header-demo-content">
    <a-page-header
      :title="userInfo.username"
      class="site-page-header"
      :sub-title="userInfo.account"
      :avatar="{ src: '' }"
    >
      <template #tags>
        <a-tag color="blue">ID: {{ userInfo.role_id }}</a-tag>
      </template>
      <template #extra>
        <!-- <a-button key="3">Operation</a-button>
        <a-button key="2">Operation</a-button> -->
        <!-- <a-switch v-model:checked="checked" /> -->
        <a-tag>
          {{ formattedDate }}
        </a-tag>
        <a-tag v-if="dutyPerson">
          {{ dutyPerson }}
        </a-tag>
        <a-button key="1" type="primary" danger @click="logout">登出</a-button>
      </template>
    </a-page-header>
  </div>
</template>
<script lang="ts" setup>
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { useUserStore } from "@/stores";
import { useRouter } from "vue-router";
import api from "@/api";
const formattedDate = ref();
const dutyPerson = ref("");
onBeforeMount(() => {
  updateDateTime().then(() => {
    getDuty();
  });
  setInterval(updateDateTime, 60 * 1000);
});
const getDuty = () => {
  const today = new Date();
  // today.setDate(today.getDate() + 2);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const dutyDay = `${year}-${month}-${day}`;
  console.log("dutyDay===>", dutyDay);
  api.getDutyData({ dutyDay: dutyDay }).then((res: any) => {
    if (res.rows.length > 0) {
      dutyPerson.value = res.rows[0].dutyPerson;
    } else {
      dutyPerson.value = "";
    }
  });
};
const updateDateTime = async () => {
  return new Promise((resolve) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 月份是从0开始计数的，所以要加1
    const day = currentDate.getDate();
    const dayOfWeek = currentDate.toLocaleDateString("zh-Cn", {
      weekday: "long",
    });
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();

    // 格式化日期时间字符串
    formattedDate.value = `${year}年${month}月${day}日 ${dayOfWeek} ${hours}:${minutes}`;
    resolve(formattedDate.value);
  });
};
const checked = ref(false);
watch(
  () => checked.value,
  () => {
    if (checked.value) {
    } else {
    }
  }
);
const router = useRouter();
const userStore = useUserStore();
const userInfo = useUserStore().userInfo;

const logout = () => {
  userStore.logout();
  router.push("/login");
};
interface IconLink {
  src: string;
  text: string;
}
const iconLinks: IconLink[] = [
  {
    src: "https://gw.alipayobjects.com/zos/rmsportal/MjEImQtenlyueSmVEfUD.svg",
    text: "Quick Start",
  },
  {
    src: "https://gw.alipayobjects.com/zos/rmsportal/NbuDUAuBlIApFuDvWiND.svg",
    text: "Product Info",
  },
  {
    src: "https://gw.alipayobjects.com/zos/rmsportal/ohOEPSYdDTNnyMbGuyLb.svg",
    text: "Product Doc",
  },
];
</script>
<style scoped>
.ant-page-header {
  padding-top: 5px;
}
</style>
