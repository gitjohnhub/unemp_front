<script setup lang="ts">
import { theme } from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';

const getPopupContainer = (el, dialogContext) =>{
        if (dialogContext) {
          return dialogContext.getDialogWrap();
        } else {
          return document.body;
        }
      }
</script>

<template>
  <a-config-provider
    :theme="{
      // algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: '#00b96b',
      },
    }"
    :getPopupContainer="getPopupContainer"
    :locale="zhCN"

  >
  <RouterView />
  </a-config-provider>


</template>
