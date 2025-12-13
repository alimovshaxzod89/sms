<template>
  <a-card 
    :bordered="false" 
    class="shadow-sm hover:shadow-md transition-shadow"
    :class="cardColorClass"
  >
    <template #title>
      <a-tag color="blue" class="text-[10px]">2024/25</a-tag>
    </template>
    <template #extra>
      <a-dropdown>
        <a-button type="text" size="small" shape="circle">
          <IconMore />
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item key="1">
              <IconEye class="w-4 h-4 inline mr-2" />
              Ko'rish
            </a-menu-item>
            <a-menu-item key="2">
              <IconEdit class="w-4 h-4 inline mr-2" />
              Tahrirlash
            </a-menu-item>
            <a-menu-item key="3">
              <IconExcel class="w-4 h-4 inline mr-2" />
              Export
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>

    <a-statistic
      :value="count"
      :value-style="{ color: valueColor }"
      :title-style="{ color: 'white', fontSize: '12px' }"
    >
      <template #title>
        <span style="color: #666; font-size: 14px; font-weight: 500;">
          {{ typeLabel }}
        </span>
      </template>
      <template #prefix>
        <component :is="iconComponent" class="w-5 h-5 ml-2" />
      </template>
    </a-statistic>
  </a-card>
</template>

<script setup>
import { computed } from 'vue';
import IconMore from '@/components/icon/IconMore.vue';
import IconEye from '@/components/icon/IconEye.vue';
import IconEdit from '@/components/icon/IconEdit.vue';
import IconExcel from '@/components/icon/IconExcel.vue';
import IconUser from '@/components/icon/menu-icons/IconUser.vue';
import IconUsers from '@/components/icon/menu-icons/IconUsers.vue';
import IconUsersTwo from '@/components/icon/menu-icons/IconUsersTwo.vue';
import IconPerson from '@/components/icon/menu-icons/IconPerson.vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 1234
  }
});

// Type configurations
const typeConfig = {
  student: {
    label: 'O\'quvchilar',
    color: '#3f8600',
    cardClass: 'bg-gradient-to-br from-blue-50 to-blue-100',
    icon: 'IconUsers'
  },
  teacher: {
    label: 'O\'qituvchilar',
    color: '#cf1322',
    cardClass: 'bg-gradient-to-br from-purple-50 to-purple-100',
    icon: 'IconUser'
  },
  parent: {
    label: 'Ota-onalar',
    color: '#1890ff',
    cardClass: 'bg-gradient-to-br from-green-50 to-green-100',
    icon: 'IconUsersTwo'
  },
  staff: {
    label: 'Xodimlar',
    color: '#faad14',
    cardClass: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    icon: 'IconPerson'
  }
};

const config = computed(() => typeConfig[props.type] || typeConfig.student);
const typeLabel = computed(() => config.value.label);
const valueColor = computed(() => config.value.color);
const cardColorClass = computed(() => config.value.cardClass);

const iconComponent = computed(() => {
  const iconMap = {
    IconUsers,
    IconUser,
    IconUsersTwo,
    IconPerson
  };
  return iconMap[config.value.icon];
});
</script>

<style scoped>

</style>

