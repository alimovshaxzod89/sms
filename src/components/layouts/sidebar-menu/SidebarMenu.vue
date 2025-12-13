<template>
  <a-menu :items="pages" style="background-color: transparent; border: none;" mode="inline" @click="handleClickMenu" />
</template>

<script setup>
import IconAnnouncement from '@/components/icon/menu-icons/IconAnnouncement.vue';
import IconAttendance from '@/components/icon/menu-icons/IconAttendance.vue';
import IconDepartment from '@/components/icon/menu-icons/IconDepartment.vue';
import IconEvent from '@/components/icon/menu-icons/IconEvent.vue';
import IconExam from '@/components/icon/menu-icons/IconExam.vue';
import IconLesson from '@/components/icon/menu-icons/IconLesson.vue';
import IconLogOut from '@/components/icon/menu-icons/IconLogOut.vue';
import IconMail from '@/components/icon/menu-icons/IconMail.vue';
import IconPerson from '@/components/icon/menu-icons/IconPerson.vue';
import IconResults from '@/components/icon/menu-icons/IconResults.vue';
import IconSettings from '@/components/icon/menu-icons/IconSettings.vue';
import IconSubject from '@/components/icon/menu-icons/IconSubject.vue';
import IconSubTask from '@/components/icon/menu-icons/IconSubTask.vue';
import IconUser from '@/components/icon/menu-icons/IconUser.vue';
import IconUsers from '@/components/icon/menu-icons/IconUsers.vue';
import IconUsersTwo from '@/components/icon/menu-icons/IconUsersTwo.vue';
import IconMenuHome from '@/components/icon/menu-icons/IconMenuHome.vue';
import { h, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import IconMortarboard from '@/components/icon/menu-icons/IconMortarboard.vue';

const router = useRouter();
const route = useRoute();
const pages = reactive([
  // ADMIN ROLE
  {
    type: 'group',
    label: "MENU",
    children: [
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
        icon: () => h(IconMortarboard),
        label: 'Teachers',
        name: 'Teachers',
      },
      {
        path: 'admin/students',
        key: 'students',
        role: 'ADMIN',
        icon: () => h(IconUsers),
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
        path: 'admin/subjects',
        key: 'subjects',
        role: 'ADMIN',
        icon: () => h(IconSubject),
        label: 'Subjects',
        name: 'Subjects',
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
        path: 'admin/results',
        key: 'results',
        role: 'ADMIN',
        icon: () => h(IconResults),
        label: 'Results',
        name: 'Results',
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
        path: 'admin/events',
        key: 'events',
        role: 'ADMIN',
        icon: () => h(IconEvent),
        label: 'Events',
        name: 'Events',
      },
      // {
      //   path: 'admin/calendar',
      //   key: 'calendar',
      //   role: 'ADMIN',
      //   icon: () => h(IconCalendar),
      //   label: 'Calendar',
      //   name: 'Calendar',
      // },
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
      // {
      //   path: 'admin/courses',
      //   key: 'courses',
      //   role: 'ADMIN',
      //   icon: () => h(IconBook),
      //   label: 'Courses',
      //   name: 'Courses',
      // },
    ]
  },
  {
    type: 'group',
    label: "OTHER",
    children: [
      {
        path: 'admin/profile',
        key: 'profile',
        role: 'ADMIN',
        icon: () => h(IconPerson),
        label: 'Profile',
        name: 'Profile',
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
        path: 'admin/logout',
        key: 'logout',
        role: 'ADMIN',
        icon: () => h(IconLogOut),
        label: 'Logout',
        name: 'Logout',
      },
    ]
  }
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

function handleClickMenu({ item }) {
  const { path, name } = item;
  if (name !== route.name) {
    router.push(`/dashboard/${path}`)
  }
  emit('menu-click')
}
</script>

<style scoped></style>
