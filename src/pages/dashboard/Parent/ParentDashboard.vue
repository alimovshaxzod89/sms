<template>
  <div class="p-4 flex gap-4 flex-col xl:flex-row min-h-[calc(100vh-100px)]">
    <!-- Left -->
    <div class="w-full xl:w-2/3 h-full">
      <BigCalendar class-group="John Doe" class="h-full" />
    </div>

    <!-- RIGHT -->
    <div class="w-full xl:w-1/3 flex flex-col gap-8">
      <EventCalendar />
      <Announcements />
    </div>
  </div>
</template>

<script setup>
import Announcements from '@/components/ui/Announcements.vue';
import EventCalendar from '@/components/ui/calendars/EventCalendar.vue';
import BigCalendar from '@/components/ui/calendars/BigCalendar.vue';
</script>

<style scoped>

</style>