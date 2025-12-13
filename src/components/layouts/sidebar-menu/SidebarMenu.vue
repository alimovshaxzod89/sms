<template>
  <a-menu
    :items="pages" 
    style="background-color: transparent; border: none;"
    mode="inline"
    @click="handleClickMenu"
    />
</template>

<script setup>
import IconAnnouncement from '@/components/icon/IconAnnouncement.vue';
import IconAttendance from '@/components/icon/IconAttendance.vue';
import IconBook from '@/components/icon/IconBook.vue';
import IconCalendar from '@/components/icon/IconCalendar.vue';
import IconDepartment from '@/components/icon/IconDepartment.vue';
import IconExam from '@/components/icon/IconExam.vue';
import IconLesson from '@/components/icon/IconLesson.vue';
import IconLogOut from '@/components/icon/IconLogOut.vue';
import IconMail from '@/components/icon/IconMail.vue';
import IconPerson from '@/components/icon/IconPerson.vue';
import IconSettings from '@/components/icon/IconSettings.vue';
import IconSubTask from '@/components/icon/IconSubTask.vue';
import IconUser from '@/components/icon/IconUser.vue';
import IconUsers from '@/components/icon/IconUsers.vue';
import IconUsersTwo from '@/components/icon/IconUsersTwo.vue';
import IconMenuHome from '@/components/icon/menu-icons/IconMenuHome.vue';
import { h, reactive } from 'vue';
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
    path: 'admin/teachers',
    key: 'teachers',
    role: 'ADMIN',
    icon: () => h(IconUsers),
    label: 'Teachers',
    name: 'Teachers',
  },
  {
    path: 'admin/students',
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
    icon: () => h(IconUsersTwo),
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
    icon: () => h(IconLesson),
    label: 'Lessons',
    name: 'Lessons',
  },
  {
    path: 'admin/exams',
    key: 'exams',
    role: 'ADMIN',
    icon: () => h(IconExam),
    label: 'Exams',
    name: 'Exams',
  },
  {
    path: 'admin/assignments',
    key: 'assignments',
    role: 'ADMIN',
    icon: () => h(IconSubTask),
    label: 'Assignments',
    name: 'Assignments',
  },
  {
    path: 'admin/attendance',
    key: 'attendance',
    role: 'ADMIN',
    icon: () => h(IconAttendance),
    label: 'Attendance',
    name: 'Attendance',
  },
  {
    path: 'admin/calendar',
    key: 'calendar',
    role: 'ADMIN',
    icon: () => h(IconCalendar),
    label: 'Calendar',
    name: 'Calendar',
  },
  {
    path: 'admin/messages',
    key: 'messages',
    role: 'ADMIN',
    icon: () => h(IconMail),
    label: 'Messages',
    name: 'Messages',
  },
  {
    path: 'admin/announcements',
    key: 'announcements',
    role: 'ADMIN',
    icon: () => h(IconAnnouncement),
    label: 'Announcements',
    name: 'Announcements',
  },
  {
    path: 'admin/courses',
    key: 'courses',
    role: 'ADMIN',
    icon: () => h(IconBook),
    label: 'Courses',
    name: 'Courses',
  },
  {
    path: 'admin/settings',
    key: 'settings',
    role: 'ADMIN',
    icon: () => h(IconSettings),
    label: 'Settings',
    name: 'Settings',
  },
  {
    path: 'admin/profile',
    key: 'profile',
    role: 'ADMIN',
    icon: () => h(IconPerson),
    label: 'Profile',
    name: 'Profile',
  },
  {
    path: 'admin/logout',
    key: 'logout',
    role: 'ADMIN',
    icon: () => h(IconLogOut),
    label: 'Logout',
    name: 'Logout',
  },
  // TEACHER ROLE
  // {
  //   path: 'teacher',
  //   key: 'teacher-home',
  //   role: 'TEACHER',
  //   icon: () => h(IconMenuHome),
  //   label: 'Home',
  //   name: 'TeacherHome',
  // },
  // {
  //   path: 'teacher/teachers',
  //   key: 'teacher-teachers',
  //   role: 'TEACHER',
  //   icon: () => h(IconUsers),
  //   label: 'Teachers',
  //   name: 'TeacherTeachers',
  // },
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
