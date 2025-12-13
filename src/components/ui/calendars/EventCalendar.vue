<template>
    <a-card :bordered="false" class="shadow-sm">
        <template #title>
            <a-space>
                <IconFlag class="w-5 h-5" />
                <span>Taqvim</span>
            </a-space>
        </template>
        
        <a-calendar 
            v-model:value="value" 
            :fullscreen="false" 
            @panelChange="onPanelChange"
            @select="onSelectDate"
        />
        
        <a-divider />
        
        <div class="flex justify-between items-center mb-4">
            <a-space>
                <IconClock class="w-5 h-5" />
                <a-typography-title :level="5" class="!mb-0">
                    Voqealar
                </a-typography-title>
                <a-badge :count="events.length" />
            </a-space>
            <a-dropdown>
                <a-button type="text" size="small" shape="circle">
                    <IconMore />
                </a-button>
                <template #overlay>
                    <a-menu>
                        <a-menu-item key="1">
                            <IconPlus class="w-4 h-4 inline mr-2" />
                            Yangi voqea
                        </a-menu-item>
                        <a-menu-item key="2">
                            <IconEye class="w-4 h-4 inline mr-2" />
                            Barchasini ko'rish
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </div>

        <!-- Events Timeline -->
        <a-timeline mode="left">
            <a-timeline-item 
                v-for="(event, index) in events" 
                :key="event.id"
                :color="index % 2 === 0 ? 'blue' : 'purple'"
            >
                <template #dot>
                    <IconClockCheck class="w-4 h-4" />
                </template>
                
                <a-card 
                    size="small" 
                    :bordered="false"
                    :class="index % 2 === 0 ? 'bg-blue-50' : 'bg-purple-50'"
                >
                    <div class="flex items-start justify-between gap-2">
                        <a-space direction="vertical" :size="2" class="flex-1">
                            <a-typography-text strong class="text-gray-700">
                                {{ event.title }}
                            </a-typography-text>
                            <a-typography-text type="secondary" class="text-xs">
                                {{ event.description }}
                            </a-typography-text>
                        </a-space>
                    </div>
                    <a-tag color="blue" size="small" class="mt-2">
                        <template #icon>
                            <IconClock class="w-3 h-3" />
                        </template>
                        {{ event.time }}
                    </a-tag>
                </a-card>
            </a-timeline-item>
        </a-timeline>
    </a-card>
</template>

<script setup>
import { ref } from 'vue';
import IconMore from '@/components/icon/IconMore.vue';
import IconFlag from '@/components/icon/IconFlag.vue';
import IconClock from '@/components/icon/IconClock.vue';
import IconClockCheck from '@/components/icon/IconClockCheck.vue';
import IconPlus from '@/components/icon/IconPlus.vue';
import IconEye from '@/components/icon/IconEye.vue';

const value = ref();
const events = ref([
    {
        id: 1,
        title: 'Matematika olimpiadasi',
        time: '12:00 - 14:00',
        description: 'Barcha sinflar uchun matematika olimpiadasi',
    },
    {
        id: 2,
        title: 'Ota-onalar yig\'ilishi',
        time: '15:00 - 17:00',
        description: '9-10 sinflar uchun ota-onalar yig\'ilishi',
    },
    {
        id: 3,
        title: 'Sport musobaqasi',
        time: '10:00 - 12:00',
        description: 'Maktablararo futbol musobaqasi',
    },
]);

const onPanelChange = (value, mode) => {
    console.log('Panel changed:', value, mode);
};

const onSelectDate = (date) => {
    console.log('Date selected:', date);
};
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

