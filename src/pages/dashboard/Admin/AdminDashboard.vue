<template>
  <div class="p-4">
    <!-- Welcome Alert -->
    <a-alert
      message="Admin Dashboard"
      description="Markaz boshqaruv tizimiga xush kelibsiz. Umumiy statistika va ma'lumotlar."
      type="info"
      show-icon
      closable
      class="mb-4"
    />

    <!-- Main Content with Loading -->
    <a-spin :spinning="loading" tip="Yuklanmoqda...">
      <a-row :gutter="[16, 16]">
        <!-- Left Side - Statistics and Charts -->
        <a-col :xs="24" :lg="16">
          <a-space direction="vertical" :size="16" style="width: 100%">
            <!-- User Statistics Cards -->
            <a-row :gutter="[16, 16]">
              <a-col :xs="24" :sm="12" :lg="6">
                <UserCard type="student" :count="120" />
              </a-col>
              <a-col :xs="24" :sm="12" :lg="6">
                <UserCard type="teacher" :count="6" />
              </a-col>
              <a-col :xs="24" :sm="12" :lg="6">
                <UserCard type="parent" :count="120" />
              </a-col>
              <a-col :xs="24" :sm="12" :lg="6">
                <UserCard type="staff" :count="10" />
              </a-col>
            </a-row>

            <!-- Charts Row -->
            <a-row :gutter="[16, 16]">
              <a-col :xs="24" :lg="12">
                <CountChart />
              </a-col>
              <a-col :xs="24" :lg="12">
                <AttendanceChart />
              </a-col>
            </a-row>

            <!-- Finance Chart -->
            <a-row>
              <a-col :span="24">
                <FinanceChart />
              </a-col>
            </a-row>
          </a-space>
        </a-col>

        <!-- Right Side - Calendar and Announcements -->
        <a-col :xs="24" :lg="8">
          <a-space direction="vertical" :size="16" style="width: 100%">
            <EventCalendar />
            <Announcements />
          </a-space>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import UserCard from '@/components/ui/cards/UserCard.vue';
import CountChart from '@/components/ui/charts/CountChart.vue';
import AttendanceChart from '@/components/ui/charts/AttendanceChart.vue';
import FinanceChart from '@/components/ui/charts/FinanceChart.vue';
import EventCalendar from '@/components/ui/calendars/EventCalendar.vue';
import Announcements from '@/components/ui/Announcements.vue';

// Loading state
const loading = ref(false);
</script>

<style scoped>

</style>