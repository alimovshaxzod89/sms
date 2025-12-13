<template>
    <a-card 
        :bordered="false" 
        class="shadow-sm"
    >
        <template #title>
            <a-space>
                <IconAnnouncement class="w-5 h-5" />
                <span>E'lonlar</span>
                <a-badge :count="announcements.length" :overflow-count="99" />
            </a-space>
        </template>
        <template #extra>
            <a-button type="link" size="small">
                Barchasini ko'rish
            </a-button>
        </template>

        <!-- Empty State -->
        <a-empty 
            v-if="!announcements.length"
            description="E'lonlar mavjud emas"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
        >
            <a-button type="primary">
                <template #icon>
                    <IconPlus class="w-4 h-4" />
                </template>
                E'lon qo'shish
            </a-button>
        </a-empty>

        <!-- Announcements List -->
        <a-list
            v-else
            :data-source="announcements"
            :split="false"
        >
            <template #renderItem="{ item, index }">
                <a-list-item class="px-0">
                    <a-card 
                        :bordered="false"
                        size="small"
                        class="w-full"
                        :class="index % 2 === 0 ? 'bg-blue-50' : 'bg-purple-50'"
                    >
                    
                        <template #title>
                            <a-typography-title :level="5" class="">
                                {{ item.title }}
                            </a-typography-title>
                        </template>
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex-1">
                                <a-space direction="vertical" :size="4" class="w-full">
                                    <a-typography-paragraph 
                                        class="!mb-0 text-gray-500" 
                                        :ellipsis="{ rows: 2, expandable: true, symbol: 'Ko\'proq' }"
                                        :content="item.description"
                                        >
                                    </a-typography-paragraph>
                                    <a-tag color="blue">
                                        <template #icon>
                                            <IconClock class="w-3 h-3" />
                                        </template>
                                        {{ item.date }}
                                    </a-tag>
                                </a-space>
                            </div>
                        </div>
                    </a-card>
                </a-list-item>
            </template>
        </a-list>
    </a-card>
</template>

<script setup>
import { ref } from 'vue';
import { Empty } from 'ant-design-vue';
import IconAnnouncement from '@/components/icon/menu-icons/IconAnnouncement.vue';
import IconPlus from '@/components/icon/IconPlus.vue';
import IconClock from '@/components/icon/IconClock.vue';

const announcements = ref([
    {
        id: 1,
        title: 'Yangi o\'quv yili boshlanishi',
        date: '2025-01-01',
        description: 'Hurmatli o\'quvchilar va ota-onalar! Yangi o\'quv yili 1-sentabrda boshlanadi. Barcha o\'quvchilar soat 8:00 da maktabda bo\'lishlari kerak.'
    },
    {
        id: 2,
        title: 'Sport musobaqasi',
        date: '2025-01-02',
        description: 'Maktabimizda sport musobaqasi o\'tkaziladi. Ishtirok etmoqchi bo\'lgan o\'quvchilar ro\'yxatdan o\'tishlari mumkin.'
    },
    {
        id: 3,
        title: 'Ota-onalar yig\'ilishi',
        date: '2025-01-03',
        description: 'Barcha ota-onalar uchun yig\'ilish 15-sentabrda soat 17:00 da bo\'lib o\'tadi. Ishtirok etishingizni so\'raymiz.'
    }
]);
</script>
<style scoped>

</style>
