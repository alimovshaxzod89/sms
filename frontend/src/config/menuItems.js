import IconAnnouncement from "@/components/icon/menu-icons/IconAnnouncement.vue";
import IconAttendance from "@/components/icon/menu-icons/IconAttendance.vue";
import IconDepartment from "@/components/icon/menu-icons/IconDepartment.vue";
import IconEvent from "@/components/icon/menu-icons/IconEvent.vue";
import IconExam from "@/components/icon/menu-icons/IconExam.vue";
import IconLesson from "@/components/icon/menu-icons/IconLesson.vue";
import IconLogOut from "@/components/icon/menu-icons/IconLogOut.vue";
import IconMail from "@/components/icon/menu-icons/IconMail.vue";
import IconPerson from "@/components/icon/menu-icons/IconPerson.vue";
import IconResults from "@/components/icon/menu-icons/IconResults.vue";
import IconSettings from "@/components/icon/menu-icons/IconSettings.vue";
import IconSubject from "@/components/icon/menu-icons/IconSubject.vue";
import IconSubTask from "@/components/icon/menu-icons/IconSubTask.vue";
import IconUsers from "@/components/icon/menu-icons/IconUsers.vue";
import IconUsersTwo from "@/components/icon/menu-icons/IconUsersTwo.vue";
import IconMenuHome from "@/components/icon/menu-icons/IconMenuHome.vue";
import IconMortarboard from "@/components/icon/menu-icons/IconMortarboard.vue";
import { h } from "vue";

/**
 * Menu items konfiguratsiyasi
 * visible array - qaysi rollarda ko'rinishi kerakligini belgilaydi
 */
export const menuItemsConfig = [
  {
    title: "MENU",
    items: [
      {
        icon: () => h(IconMenuHome),
        label: "Home",
        href: "/",
        key: "home",
        name: "Home",
        visible: ["admin", "teacher", "student", "parent"],
        // Har bir rol uchun path
        paths: {
          admin: "admin",
          teacher: "teacher",
          student: "student",
          parent: "parent",
        },
      },
      {
        icon: () => h(IconMortarboard),
        label: "Teachers",
        href: "/list/teachers",
        key: "teachers",
        name: "Teachers",
        visible: ["admin", "teacher"],
        paths: {
          admin: "admin/teachers",
          teacher: "teacher/teachers",
        },
      },
      {
        icon: () => h(IconUsers),
        label: "Students",
        href: "/list/students",
        key: "students",
        name: "Students",
        visible: ["admin", "teacher"],
        paths: {
          admin: "admin/students",
          teacher: "teacher/students",
        },
      },
      {
        icon: () => h(IconUsersTwo),
        label: "Parents",
        href: "/list/parents",
        key: "parents",
        name: "Parents",
        visible: ["admin", "teacher"],
        paths: {
          admin: "admin/parents",
        },
      },
      {
        icon: () => h(IconSubject),
        label: "Subjects",
        href: "/list/subjects",
        key: "subjects",
        name: "Subjects",
        visible: ["admin"],
        paths: {
          admin: "admin/subjects",
        },
      },
      {
        icon: () => h(IconDepartment),
        label: "Classes",
        href: "/list/classes",
        key: "classes",
        name: "Classes",
        visible: ["admin", "teacher"],
        paths: {
          admin: "admin/classes",
          teacher: "teacher/classes",
        },
      },
      {
        icon: () => h(IconLesson),
        label: "Lessons",
        href: "/list/lessons",
        key: "lessons",
        name: "Lessons",
        visible: ["admin", "teacher"],
        paths: {
          admin: "admin/lessons",
          teacher: "teacher/lessons",
        },
      },
      {
        icon: () => h(IconExam),
        label: "Exams",
        href: "/list/exams",
        key: "exams",
        name: "Exams",
        visible: ["admin", "teacher", "student", "parent"],
        paths: {
          admin: "admin/exams",
          teacher: "teacher/exams",
          student: "student/exams",
          parent: "parent/exams",
        },
      },
      {
        icon: () => h(IconSubTask),
        label: "Assignments",
        href: "/list/assignments",
        key: "assignments",
        name: "Assignments",
        visible: ["admin", "teacher", "student", "parent"],
        paths: {
          admin: "admin/assignments",
          teacher: "teacher/assignments",
          student: "student/assignments",
          parent: "parent/assignments",
        },
      },
      {
        icon: () => h(IconResults),
        label: "Results",
        href: "/list/results",
        key: "results",
        name: "Results",
        visible: ["admin", "teacher", "student", "parent"],
        paths: {
          admin: "admin/results",
          teacher: "teacher/results",
          student: "student/results",
          parent: "parent/results",
        },
      },
      {
        icon: () => h(IconAttendance),
        label: "Attendance",
        href: "/list/attendance",
        key: "attendance",
        name: "Attendance",
        visible: ["admin", "teacher", "student", "parent"],
        paths: {
          admin: "admin/attendance",
          teacher: "teacher/attendance",
          student: "student/attendance",
          parent: "parent/attendance",
        },
      },
      {
        icon: () => h(IconEvent),
        label: "Events",
        href: "/list/events",
        key: "events",
        name: "Events",
        visible: ["admin", "teacher", "student", "parent"],
        paths: {
          admin: "admin/events",
          teacher: "teacher/events",
          student: "student/events",
          parent: "parent/events",
        },
      },
      {
        icon: () => h(IconMail),
        label: "Messages",
        href: "/list/messages",
        key: "messages",
        name: "Messages",
        visible: ["admin", "teacher", "student", "parent"],
        paths: {
          admin: "admin/messages",
          teacher: "teacher/messages",
          student: "student/messages",
          parent: "parent/messages",
        },
      },
      {
        icon: () => h(IconAnnouncement),
        label: "Announcements",
        href: "/list/announcements",
        key: "announcements",
        name: "Announcements",
        visible: ["admin", "teacher", "student", "parent"],
        paths: {
          admin: "admin/announcements",
          teacher: "teacher/announcements",
          student: "student/announcements",
          parent: "parent/announcements",
        },
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: () => h(IconPerson),
        label: "Profile",
        href: "/profile",
        key: "profile",
        name: "Profile",
        visible: ["admin", "teacher", "student", "parent"],
        paths: {
          admin: "admin/profile",
          teacher: "teacher/profile",
          student: "student/profile",
          parent: "parent/profile",
        },
      },
      {
        icon: () => h(IconSettings),
        label: "Settings",
        href: "/settings",
        key: "settings",
        name: "Settings",
        visible: ["admin", "teacher", "student", "parent"],
        paths: {
          admin: "admin/settings",
          teacher: "teacher/settings",
          student: "student/settings",
          parent: "parent/settings",
        },
      },
      {
        icon: () => h(IconLogOut),
        label: "Logout",
        href: "/logout",
        key: "logout",
        name: "Logout",
        visible: ["admin", "teacher", "student", "parent"],
        paths: {},
      },
    ],
  },
];