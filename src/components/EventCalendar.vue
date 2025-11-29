<template>
    <div class="bg-white rounded-2xl p-4">
        <a-calendar v-model:value="value" :fullscreen="false" @panelChange="onPanelChange" />
        <div class="flex justify-between items-center gap-4">
            <h1 class="text-xl font-semibold my-4">Events</h1>
            <IconMore />
        </div>
        <div class="flex flex-col gap-4">
            <ul>
                <li v-for="event in events" :key="event.id"
                    class="p-5 mt-2 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-blue-100 even:border-t-blue-200">
                    <div class="flex items-center justify-between">
                        <h1 class="text-lg font-semibold text-gray-600">{{ event.title }}</h1>
                        <span class="text-xs text-gray-400">{{ event.time }}</span>
                    </div>
                    <p class="mt-2 text-gray-500 text-sm">{{ event.description }}</p>
                </li>
            </ul>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import IconMore from './icon/IconMore.vue';
//   import { Moment } from 'moment';

const value = ref();
const events = ref([
    {
        id: 1,
        title: 'Event 1',
        time: '12:00 PM - 2:00 PM',
        description: 'This is a description of the event',
    },
    {
        id: 2,
        title: 'Event 2',
        time: '12:00 PM - 2:00 PM',
        description: 'This is a description of the event',
    },
    {
        id: 3,
        title: 'Event 3',
        time: '12:00 PM - 2:00 PM',
        description: 'This is a description of the event',
    },
])

const onPanelChange = (value, mode) => {
    console.log(value, mode);
}

</script>
<style scoped>
:deep(.ant-picker-calendar-header) {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 10px !important;
    border-bottom: 1px solid #d9d9d9 !important;
}
</style>