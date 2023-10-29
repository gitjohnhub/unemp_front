<template>
  <h1>test</h1>
  {{ dynamicValidateForm.years }}
  <a-button @click="addyear">add</a-button>
</template>
<script setup lang="ts">
import {watch, reactive} from 'vue'

const dynamicValidateForm = reactive({
  years: []
})
const addyear = ()=>{
  console.log('add push')
  dynamicValidateForm.years = [...dynamicValidateForm.years, 2022]
}
watch(
  () => dynamicValidateForm.years,
  (newVal, oldVal) => {
    console.log(newVal)
  }
)

</script>