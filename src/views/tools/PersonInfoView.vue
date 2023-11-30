<template>
  <a-space direction="vertical">
    <a-input-group compact>
      <a-input
        addon-before="根据身份证号获得年龄和性别"
        v-model:value="personID"
        style="text-align: center"
        placeholder="身份证号"
      />
    </a-input-group>
    <a-tag color="#5492ED">{{ genderAndage.gender }} {{ genderAndage.age }}</a-tag>
  </a-space>
  <!-- 数字识别 -->
  <a-card>
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      :multiple="false"
      :max-count="1"
      :customRequest="customRequest"
      @remove="handleRemove"
      list-type="picture-card"
      @preview="handlePreview"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined></inbox-outlined>
      </p>
      <p class="ant-upload-text">插入图片自动识别进行复制</p>
      <p class="ant-upload-hint">支持图片格式的文件</p>
    </a-upload-dragger>
    <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </a-card>
  <a-card  v-if="regonizeResult">
    <a-tooltip :title="pinyin(regonizeResult)" color="#f50">
      <a-typography-paragraph
        :style="{ fontSize: '18px' }"
        copyable
        keyboard
        >{{ regonizeResult }}</a-typography-paragraph
      >
    </a-tooltip>
  </a-card>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import type { UploadProps } from 'ant-design-vue';
import { handleTesseract } from '@/utils/util';
import { pinyin } from 'pinyin-pro';

//获得身份证号年龄+性别
const regonizeResult = ref();
const personID = ref();
const genderAndage = computed(() => getGenderAndAge());
//文字识别相关
const fileList = ref([]);
const customRequest = (options: any) => {
  const { onProgress, onError, onSuccess, file } = options;
  handleTesseract(file, handleResult)
    .then((result: any) => {
      regonizeResult.value = result;
      onProgress({ percent: 100 });
      onSuccess(result);
    })
    .catch((e) => {
      onError(e);
    });
};
const handleRemove = (file: File) => {
  const index = fileList.value!.indexOf(file);
  const newFileList = fileList.value.slice();
  newFileList.splice(index, 1);
  fileList.value = newFileList;
};
const handleResult = (result: string) => {
  console.log(result);
  return result;
};
// 文件预览
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
function getGenderAndAge() {
  if (personID.value) {
    if (personID.value.length == 18) {
      const year = personID.value.slice(6, 10);
      const month = personID.value.slice(10, 12);
      const day = personID.value.slice(12, 14);
      const genderCode = personID.value.slice(16, 17);

      const birth = new Date(year + '/' + month + '/' + day);
      const now = new Date();

      const age = now.getFullYear() - birth.getFullYear();
      let gender = '';
      if (genderCode % 2 === 0) {
        gender = '女';
      } else {
        gender = '男';
      }

      return {
        gender,
        age,
      };
    } else {
      return { gender: 0, age: 0 };
    }
  } else {
    return { gender: 0, age: 0 };
  }
}
</script>
