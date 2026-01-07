/**
 * Autentifikatsiya guard'i
 * Foydalanuvchi tizimga kirganligini tekshiradi
 */
export const authGuard = (to, from, next) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Token yo'q bo'lsa, login sahifasiga yo'naltirish
  if (!token || !role) {
    next({ name: "LoginPageView" });
    return;
  }

  next();
};

/**
 * Rolga asoslangan guard
 * Foydalanuvchi roli route meta.role bilan mos kelishini tekshiradi
 */
export const roleGuard = (to, from, next) => {
  const role = localStorage.getItem("role")?.toUpperCase();
  const requiredRole = to.meta?.role;

  if (!requiredRole) {
    // Rol talab qilinmasa, o'tkazish
    next();
    return;
  }

  if (role === requiredRole) {
    // Rol mos kelsa, o'tkazish
    next();
    return;
  }

  // Rol mos kelmasa, tegishli dashboard'ga yo'naltirish
  const roleRouteMap = {
    ADMIN: "AdminDashboard",
    TEACHER: "TeacherDashboard",
    STUDENT: "StudentDashboard",
    PARENT: "ParentDashboard",
  };

  const redirectRoute = roleRouteMap[role];
  if (redirectRoute) {
    next({ name: redirectRoute });
  } else {
    next({ name: "LoginPageView" });
  }
};

/**
 * Guest guard
 * Faqat autentifikatsiya qilinmagan foydalanuvchilar uchun
 */
export const guestGuard = (to, from, next) => {
  const token = localStorage.getItem("token");

  if (token) {
    // Token bor bo'lsa, dashboard'ga yo'naltirish
    const role = localStorage.getItem("role")?.toUpperCase();
    const roleRouteMap = {
      ADMIN: "AdminDashboard",
      TEACHER: "TeacherDashboard",
      STUDENT: "StudentDashboard",
      PARENT: "ParentDashboard",
    };

    const redirectRoute = roleRouteMap[role] || "AdminDashboard";
    next({ name: redirectRoute });
  } else {
    next();
  }
};
