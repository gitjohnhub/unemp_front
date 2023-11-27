<template>
    <a-form layout="inline">
        <a-form-item label="日期">
            <a-date-picker v-model:value="selectDay" />
        </a-form-item>
        <a-form-item label="人员">
            <a-input v-model:value="dutyPerson" />
        </a-form-item>
        <a-form-item>
            <a-button type="primary" @click="addDuty">增加</a-button>
        </a-form-item>


    </a-form>
    <a-calendar v-model:value="value">
        <template #dateCellRender="{ current }">
            <ul class="events" v-if="dataSource">
                <li v-for="item in getListData(current)" >
                    <a-badge v-if='item.dutyPerson' :text="item.dutyPerson" />
                </li>
            </ul>
        </template>
        <!-- <template #monthCellRender="{ current }">
        <div v-if="getMonthData(current)" class="notes-month">
          <section>{{ getMonthData(current) }}</section>
          <span>Backlog number</span>
        </div>
      </template> -->
    </a-calendar>
</template>
<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';
import { message } from 'ant-design-vue';
import { Dayjs } from 'dayjs';
import api from '@/api'
import { useUserStore } from '@/stores';

const value = ref<Dayjs>();
const selectDay = ref<Dayjs>()
const dutyPerson = ref('')
const dataSource = ref()
const userStore = useUserStore();
const userInfo = userStore.userInfo;
const usersList = ref()
onBeforeMount(() => {
    userStore.getUsers();
    usersList.value = userStore.usersList
    console.log(usersList.value)
    getData()
})
const addDuty = () => {
    api.addDutyData({
        dutyDay: selectDay.value.format('YYYY-MM-DD'),
        dutyPerson: dutyPerson.value
    }).then(() => {
        message.info('添加成功')
        getData()

    })
}
const getData = (params?: any) => {
    params = {
        ...params
    }
    api.getDutyData(params).then((res: any) => {
        console.log(res)
        dataSource.value = res.rows
    })

}
const getListData = (current: Dayjs) => {
    const dutyday = current.format("YYYY-MM-DD")
    const item = dataSource.value.find(item => item.dutyDay == dutyday)
    if (item){
        console.log('item--->',item)
    return [item]
    }else{
        return [{
            dutyPerson : ''
        }]
    }



};
</script>
<style scoped>
.events {
    list-style: none;
    margin: 0;
    padding: 0;
}

.events .ant-badge-status {
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
    text-overflow: ellipsis;
    font-size: 12px;
}

.notes-month {
    text-align: center;
    font-size: 28px;
}

.notes-month section {
    font-size: 28px;
}
</style>
  