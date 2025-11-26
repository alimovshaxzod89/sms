<template>
  <a-menu
    :items="pages" 
    style="background-color: transparent; border: none;"
    mode="inline"
    @click="handleClickMenu"
    />
</template>

<script setup>
import IconDepartment from '@/components/icon/IconDepartment.vue';
import IconEmployees from '@/components/icon/IconEmployees.vue';
import IconEye from '@/components/icon/IconEye.vue';
import IconUser from '@/components/icon/IconUser.vue';
import IconUsers from '@/components/icon/IconUsers.vue';
import IconMenuHome from '@/components/icon/menu-icons/IconMenuHome.vue';
import { h, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const pages = reactive([
  // ADMIN ROLE
  {
    path: 'admin',
    key: 'home',
    role: 'ADMIN',
    icon: () => h(IconMenuHome),
    label: 'Home',
    name: 'Home',
  },
  {
    path: 'teachers',
    key: 'teachers',
    role: 'ADMIN',
    icon: () => h(IconUsers),
    label: 'Teachers',
    name: 'Teachers',
  },
  {
    path: 'students',
    key: 'students',
    role: 'ADMIN',
    icon: () => h(IconUser),
    label: 'Students',
    name: 'Students',
  },
  {
    path: 'admin/parents',
    key: 'parents',
    role: 'ADMIN',
    icon: () => h(IconUsers),
    label: 'Parents',
    name: 'Parents',
  },
  {
    path: 'admin/classes',
    key: 'classes',
    role: 'ADMIN',
    icon: () => h(IconDepartment),
    label: 'Classes',
    name: 'Classes',
  },
  {
    path: 'admin/lessons',
    key: 'lessons',
    role: 'ADMIN',
    icon: () => h(IconEmployees),
    label: 'Lessons',
    name: 'Lessons',
  },
  {
    path: 'admin/exams',
    key: 'exams',
    role: 'ADMIN',
    icon: () => h(IconEye),
    label: 'Exams',
    name: 'Exams',
  },
  {
    path: 'admin/assignments',
    key: 'assignments',
    role: 'ADMIN',
    icon: () => h(IconEye),
    label: 'Assignments',
    name: 'Assignments',
  },
  {
    path: 'admin/attendance',
    key: 'attendance',
    role: 'ADMIN',
    icon: () => h(IconEye),
    label: 'Attendance',
    name: 'Attendance',
  },
  {
    path: 'admin/calendar',
    key: 'calendar',
    role: 'ADMIN',
    icon: () => h(IconEye),
    label: 'Calendar',
    name: 'Calendar',
  },
  {
    path: 'admin/messages',
    key: 'messages',
    role: 'ADMIN',
    icon: () => h(IconEye),
    label: 'Messages',
    name: 'Messages',
  },
  {
    path: 'admin/announcements',
    key: 'announcements',
    role: 'ADMIN',
    icon: () => h(IconEye),
    label: 'Announcements',
    name: 'Announcements',
  },
  {
    path: 'admin/courses',
    key: 'courses',
    role: 'ADMIN',
    icon: () => h(IconEye),
    label: 'Courses',
    name: 'Courses',
  },
  {
    path: 'admin/settings',
    key: 'settings',
    role: 'ADMIN',
    icon: () => h(IconEye),
    label: 'Settings',
    name: 'Settings',
  },
  {
    path: 'admin/profile',
    key: 'profile',
    role: 'ADMIN',
    icon: () => h(IconEye),
    label: 'Profile',
    name: 'Profile',
  },
  {
    path: 'admin/logout',
    key: 'logout',
    role: 'ADMIN',
    icon: () => h(IconEye),
    label: 'Logout',
    name: 'Logout',
  },
])

const emit = defineEmits(['menu-click'])

function handleClickMenu({item}) {
  const {path, name} = item;
  if (name !== route.name) {
    router.push(`/dashboard/${path}`)
  }
  emit('menu-click')
}
</script>

<style scoped>
</style>