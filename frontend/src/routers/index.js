import DashboardView from "@/pages/dashboard/DashboardView.vue";
import { createRouter, createWebHistory } from "vue-router";
import { authGuard, roleGuard, guestGuard } from "./guards/authGuard";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "LoginView",
      beforeEnter: guestGuard,
      children: [
        {
          path: "",
          name: "LoginPageView",
          component: () => import("@/pages/LoginPage.vue"),
        },
      ],
    },
    {
      path: "/dashboard",
      name: "DashboardView",
      component: DashboardView,
      beforeEnter: [authGuard, roleGuard],
      children: [
        {
          path: "admin",
          name: "AdminView",
          meta: {
            role: "ADMIN",
          },
          redirect: { name: "AdminDashboard" },
          children: [
            {
              path: "",
              name: "AdminDashboard",
              component: () =>
                import("@/pages/dashboard/Admin/AdminDashboard.vue"),
            },
            {
              path: "teachers",
              name: "TeachersView",
              redirect: { name: "Teachers" },
              children: [
                {
                  path: "",
                  name: "Teachers",
                  component: () =>
                    import("@/pages/dashboard/Admin/teachers/Teachers.vue"),
                },
                {
                  path: ":id",
                  name: "TeacherDetail",
                  component: () =>
                    import(
                      "@/pages/dashboard/Admin/teachers/TeacherDetail.vue"
                    ),
                },
              ],
            },
            {
              path: "students",
              name: "StudentsView",
              redirect: { name: "Students" },
              children: [
                {
                  path: "",
                  name: "Students",
                  component: () =>
                    import("@/pages/dashboard/Admin/students/Students.vue"),
                },
                {
                  path: ":id",
                  name: "StudentDetail",
                  component: () =>
                    import(
                      "@/pages/dashboard/Admin/students/StudentDetail.vue"
                    ),
                },
              ],
            },
            {
              path: "parents",
              name: "Parents",
              component: () =>
                import("@/pages/dashboard/Admin/parents/Parents.vue"),
            },
            {
              path: "subjects",
              name: "Subjects",
              component: () =>
                import("@/pages/dashboard/Admin/subjects/Subjects.vue"),
            },
            {
              path: "classes",
              name: "Classes",
              component: () =>
                import("@/pages/dashboard/Admin/classes/Classes.vue"),
            },
            {
              path: "lessons",
              name: "Lessons",
              component: () =>
                import("@/pages/dashboard/Admin/lessons/Lessons.vue"),
            },
            {
              path: "exams",
              name: "Exams",
              component: () =>
                import("@/pages/dashboard/Admin/exams/Exams.vue"),
            },
            {
              path: "assignments",
              name: "Assignments",
              component: () =>
                import("@/pages/dashboard/Admin/assignments/Assignments.vue"),
            },
            {
              path: "results",
              name: "Results",
              component: () =>
                import("@/pages/dashboard/Admin/results/Results.vue"),
            },
            {
              path: "events",
              name: "Events",
              component: () =>
                import("@/pages/dashboard/Admin/events/Events.vue"),
            },
            {
              path: "announcements",
              name: "Announcements",
              component: () =>
                import(
                  "@/pages/dashboard/Admin/announcements/Announcements.vue"
                ),
            },
          ],
        },
        {
          path: "student",
          name: "StudentView",
          meta: {
            role: "STUDENT",
          },
          children: [
            {
              path: "",
              name: "StudentDashboard",
              component: () =>
                import("@/pages/dashboard/Student/StudentDashboard.vue"),
            },
          ],
        },
        {
          path: "teacher",
          name: "TeacherView",
          meta: {
            role: "TEACHER",
          },
          children: [
            {
              path: "",
              name: "TeacherDashboard",
              component: () =>
                import("@/pages/dashboard/Teacher/TeacherDashboard.vue"),
            },
            {
              path: "teachers",
              name: "TeacherTeachers",
              component: () =>
                import("@/pages/dashboard/Teacher/teachers/Teachers.vue"),
            },
          ],
        },

        {
          path: "parent",
          name: "ParentView",
          meta: {
            role: "PARENT",
          },
          children: [
            {
              path: "",
              name: "ParentDashboard",
              component: () =>
                import("@/pages/dashboard/Parent/ParentDashboard.vue"),
            },
          ],
        },
      ],
      //   beforeEnter: (to, from, next) => {
      //     const userRole = localStorage.getItem("sms_role");
      //     if (userRole === to.meta?.role) {
      //       return next();
      //     } else if (userRole === "TEACHER") {
      //       return next({ name: "TeacherDashboard" });
      //     } else if (userRole === "STUDENT") {
      //       return next({ name: "StudentDashboard" });
      //     } else if (userRole === "ADMIN") {
      //       return next({ name: "AdminDashboard" });
      //     } else {
      //       return next({ path: "" });
      //     }
      //   },
      //   children: [
      //     /* SMS ADMIN PAGES */
      //     {
      //       path: "admin",
      //       name: "AdminView",
      //       meta: {
      //         role: "ADMIN",
      //       },
      //       redirect: { name: "AdminDashboard" },
      //       children: [
      //         {
      //           path: "",
      //           name: "AdminDashboard",
      //           component: () => import("@/pages/dashboard/Admin/DashboardView.vue"),
      //         },
      //         {
      //           path: "courses",
      //           name: "CoursesView",
      //           redirect: { name: "Courses" },
      //           children: [
      //             {
      //               path: "",
      //               name: "Courses",
      //               component: () =>
      //                 import("@/pages/dashboard/Admin/courses/Courses.vue"),
      //             },
      //             {
      //               path: "form",
      //               name: "CourseFormAdd",
      //               component: () =>
      //                 import("@/pages/dashboard/Admin/courses/CourseForm.vue"),
      //             },
      //             {
      //               path: "form/edit/:id",
      //               name: "CourseFormEdit",
      //               component: () =>
      //                 import("@/pages/dashboard/Admin/courses/CourseForm.vue"),
      //             },
      //           ],
      //         },
      //         {
      //           path: "classes",
      //           name: "ClassesView",
      //           redirect: { name: "Classes" },
      //           children: [
      //             {
      //               path: "",
      //               name: "Classes",
      //               component: () =>
      //                 import("@/pages/dashboard/Admin/classes/Classes.vue"),
      //             },
      //             {
      //               path: "form",
      //               name: "ClassFormAdd",
      //               component: () =>
      //                 import("@/pages/dashboard/Admin/classes/ClassForm.vue"),
      //             },
      //             {
      //               path: "form/edit/:id",
      //               name: "ClassFormEdit",
      //               component: () =>
      //                 import("@/pages/dashboard/Admin/classes/ClassForm.vue"),
      //             },
      //           ],
      //         },
      //         {
      //           path: "students",
      //           name: "StudentsView",
      //           redirect: { name: "Students" },
      //           children: [
      //             {
      //               path: "",
      //               name: "Students",
      //               component: () =>
      //                 import("@/pages/dashboard/Admin/students/Students.vue"),
      //             },
      //             {
      //               path: "form",
      //               name: "StudentFormAdd",
      //               component: () =>
      //                 import("@/pages/dashboard/Admin/students/StudentForm.vue"),
      //             },
      //             {
      //               path: "form/edit/:id",
      //               name: "StudentFormEdit",
      //               component: () =>
      //                 import("@/pages/dashboard/Admin/students/StudentForm.vue"),
      //             },
      //           ],
      //         },
      //         {
      //           path: "teachers",
      //           name: "TeachersView",
      //           redirect: { name: "Teachers" },
      //           children: [
      //             {
      //               path: "",
      //               name: "Teachers",
      //               component: () =>
      //                 import("@/pages/dashboard/Admin/teachers/Teachers.vue"),
      //             },
      //             {
      //               path: "form",
      //               name: "TeacherFormAdd",
      //               component: () =>
      //                 import("@/pages/dashboard/Admin/teachers/TeacherForm.vue"),
      //             },
      //             {
      //               path: "form/edit/:id",
      //               name: "TeacherFormEdit",
      //               component: () =>
      //                 import("@/pages/dashboard/Admin/teachers/TeacherForm.vue"),
      //             },
      //           ],
      //         },
      //       ],
      //     },

      //     /* SMS TEACHER PAGES */
      //     {
      //       path: "teacher",
      //       name: "TeacherView",
      //       meta: {
      //         role: "TEACHER",
      //       },
      //       children: [
      //         {
      //           path: "",
      //           name: "TeacherDashboard",
      //           component: () =>
      //             import("@/pages/dashboard/Teacher/Dashboard.vue"),
      //         },
      //         {
      //           path: "classes",
      //           name: "TeacherClasses",
      //           component: () =>
      //             import("@/pages/dashboard/Teacher/classes/TeacherClasses.vue"),
      //         },
      //         {
      //           path: "grading",
      //           name: "Grading",
      //           component: () =>
      //             import("@/pages/dashboard/Teacher/grading/Grading.vue"),
      //         },
      //         {
      //           path: "attendance",
      //           name: "TeacherAttendance",
      //           component: () =>
      //             import("@/pages/dashboard/Teacher/attendance/Attendance.vue"),
      //         },
      //       ],
      //     },

      //     /* SMS STUDENT PAGES */
      //     {
      //       path: "student",
      //       name: "StudentView",
      //       meta: {
      //         role: "STUDENT",
      //       },
      //       children: [
      //         {
      //           path: "",
      //           name: "StudentDashboard",
      //           component: () =>
      //             import("@/pages/dashboard/Student/Dashboard.vue"),
      //         },
      //         {
      //           path: "grades",
      //           name: "StudentGrades",
      //           component: () =>
      //             import("@/pages/dashboard/Student/grades/Grades.vue"),
      //         },
      //         {
      //           path: "attendance",
      //           name: "StudentAttendance",
      //           component: () =>
      //             import("@/pages/dashboard/Student/attendance/Attendance.vue"),
      //         },
      //       ],
      //     },
      //   ],
    },
  ],
});
