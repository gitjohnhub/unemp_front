<template>
    <a-space direction="vertical">

   <a-input-group compact>
        <a-input addon-before="根据身份证号获得年龄和性别"
          v-model:value="personID"
          style="text-align: center"
          placeholder="身份证号"
        />
    </a-input-group>
    <a-tag color="#5492ED">{{ genderAndage.gender }} {{ genderAndage.age }}</a-tag>
    </a-space>
</template>
<script setup lang="ts">
import { ref ,computed } from 'vue';
//获得身份证号年龄+性别
const personID = ref();
const genderAndage = computed(() => getGenderAndAge());
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