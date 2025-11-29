<template>
  <div class="flex gap-4 flex-col md:flex-row p-4">
    <!-- Left Side -->
     <div class="w-full lg:w-2/3">
        <div class="flex gap-4 justify-between flex-wrap">
          <UserCard type="student" />
          <UserCard type="teacher" />
          <UserCard type="parent" />
          <UserCard type="staff" />
        </div>
        <div class="flex flex-col lg:flex-row gap-4">
          <CountChart />
          <AttendanceChart />
        </div>
        <FinanceChart />
     </div>
     <!-- Right Side -->
     <div class="w-full lg:w-1/3">
      <EventCalendar />
      <Announcements />
     </div>
  </div>
</template>

<script setup>
import UserCard from '@/components/UserCard.vue';
import CountChart from '@/components/CountChart.vue';
import AttendanceChart from '@/components/AttendanceChart.vue';
import FinanceChart from '@/components/FinanceChart.vue';
import EventCalendar from '@/components/EventCalendar.vue';
import Announcements from '@/components/Announcements.vue';
</script>

<style scoped>

</style>