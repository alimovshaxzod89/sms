
**Architecture Overview (English Translation)**  
- Project structure: feature-first within `src` (`components`, `pages`, `store`, `services`, `composables`, `routers`, `utils`, `styles`). Dashboard subtrees (e.g., `pages/dashboard/Client/statistics/modules`) illustrate nested modules per domain.  
- State management: Pinia stores such as `store/employee/employees.pinia.js` define extensive `state`, `actions`, helper methods, and share `useCore` for toast/loading orchestration. `useCore` centralizes global UI concerns (drawer, loader, breadcrumb, uploads).  
- Networking: `utils/api/index.js` wraps axios with baseURL config, token + `O-Session` headers, dual interceptors (401 token refresh queue, 400 code-10 session refresh), and `useCore` error hooks. Feature services under `services/modules/**` act as mixins that rely on `setLoading/deleteLoading`.  
- Component design: `components/base-components` and `layouts` follow an atomic setup on top of Ant Design (buttons, drawers, tables, breadcrumb, loaders). Layout components host navbar/sidebar shells, while `App.vue` handles global loader/toasts.  
- Routing: `routers/index.js` defines `/dashboard` with nested employee vs. org-admin routes guarded via `beforeEnter` + `meta.role`; router factory injects i18n to update document titles.  
- UI/styling: `main.js` wires Vue 3 + Pinia + Antd + router + i18n; `styles/main.scss` imports Tailwind layers plus SCSS modules (`mixins`, `ant`, `global`, `responsive`). `App.vue` keeps `LoaderComponent` around `router-view`.

**Implementation Roadmap for SMS (English Translation)**  
_Phase 0 – Alignment & Prep_  
- Reuse existing tooling (`package.json`, `vite.config.js`, Tailwind/PostCSS). Adjust only env vars.  
- Extend `utils/i18n` and `dayjs` localizations with SMS vocabulary.

_Phase 1 – Core Architecture_  
- Clone router skeleton: `/dashboard` children for admin/teacher/student with `meta.role` and guard logic identical to current `routers/index.js`.  
- Reuse navbar/sidebar layouts; adapt icons/text to school context.  
- Keep `store/core.pinia.js` logic intact, exposing extra global state (e.g., `currentAcademicYear`).  
- Maintain composables (`setLoading/deleteLoading`, `useQueryParams`, etc.) for consistency.

_Phase 2 – State Management_  
- Auth/session stores mirror `auth.pinia.js`, `user.pinia.js`, `user-org-store.pinia.js`, `session.pinia.js` but hit SMS endpoints (e.g., `student/login`).  
- Domain stores: base `employees.pinia.js` pattern becomes `students.pinia.js` and `teachers.pinia.js` (same `fullModel`, copy diffing). Department/position/structure stores become `courses`, `classes`, `sections`.  
- Grading/attendance: build stores using statistics/KPI store conventions, reusing `useCore().setToast` and `loadingUrl`.

_Phase 3 – Networking & Services_  
- Continue using `utils/api/index.js`; swap env base URL to SMS backend.  
- For each domain (courses, classes, grades), create `services/modules/<domain>` mixins based on `employee/projects.service.js`.  
- File uploads stick with `useCore().fileUpload` + `BasePictureViewer/BaseDrawer`.

_Phase 4 – UI & Pages_  
- First port reusable atoms: `BaseButton`, `BaseTable`, `BaseDrawer`, `BaseModal`, `BaseBreadcrumb`, `LoaderComponent`, `PageHeaderComponent`, `CustomPagination`, `BaseDatePicker`, `BaseRangePicker`, `BaseIcon`, `LogoComponent`.  
- Dashboards:  
  - Admin → `pages/dashboard/Admin/**`, mirroring Client layout for courses/classes/users.  
  - Teacher → reuse Employee projects pattern for class rosters, assignments, grading modals.  
  - Student → follow Employee statistics widgets (ApexCharts + `BaseCardPicker`).  
- Grading UI leverages `BaseTable`, `SelectableRadio`, drawer-based detail forms, and `BaseModal` confirmations.  
- Course/Class forms replicate `EmployeeForm` with `fullModel`/`copyModel` updates in Pinia.

_Phase 5 – Routing & Guards_  
- Meta roles `admin/teacher/student` stored in localStorage (e.g., `sms_role`); guard logic mirrors original.  
- Use `useCore().redirect` for unauthorized flows; keep i18n-driven titles in `router.beforeEach`.

_Phase 6 – UI/Styling Finalization_  
- Preserve `styles/main.scss` import order; add SMS-specific SCSS under `styles/features`.  
- Adjust Ant theme via `utils/ant/theme.js` for school branding while keeping `a-config-provider`.  
- Maintain responsive helpers (`responsive.scss`, Tailwind utilities) and use `useCore().windowWidth` for collapses.

_Phase 7 – Enhancements_  
- Notifications: rely on `useCore().setToast` + `message.*` for create/update flows.  
- Breadcrumbs: use `core.breadcrumb` + `BaseBreadcrumb` to show Course → Class → Student navigation.  
- Filtering/history: `useQueryParams` for course/grade filters; `CustomPagination` for page state sync.

_Reusable assets to port first_  
- UI atoms listed above.  
- Layout components (`components/layouts/navbar/**`, `sidebar-menu/**`, `DashboardView`).  
- Core Pinia stores (`core`, `auth`, `session`, `user`).  
- Axios instance + service pattern.  
- Styles (`styles/main.scss`, `ant.scss`, `responsive`, `variable.scss`).

[17 tools called]

### Uzbek translation
Hozirgi sessiya “ask mode”da bo‘lgani uchun fayl yarata olmayman; quyidagi tahlil va yo‘l xaritasini kerakli faylga qo‘lda joylashtirishingizni so‘rayman.

## Arxitektura tahlili
- **Loyihaning modul dizayni** `src` papkasi ichidagi modullar bo‘yicha qatlamlangan: `components` (bazaviy va layout atomlari), `pages` (Employee/Client dashboardlari kabi sahifa daraxtlari), `store`, `services`, `composables`, `routers`, `utils`, `styles`. Dashboard sahifalari ichidagi kichik domen papkalari (masalan, `src/pages/dashboard/Client/statistics/modules`) dan ko‘rinib turibdiki, feature-first struktura saqlanadi.
- **Holat boshqaruvi** Pinia’da domenlarga bo‘lingan `defineStore` fayllari (masalan, `src/store/employee/employees.pinia.js`) katta state modellari, loading URL setlari va servis bilan ishlovchi action’lar orqali boshqariladi; `useCore` markaziy do‘kon toast, drawer, global loader va fayl yuklashni bir joyda tutadi.
- **Tarmoq qatlami** `src/utils/api/index.js` dagi axios instansiyasi token, `O-Session` headerlari, 401 va 400 (code 10) holatlariga ikkilamchi interceptorlar, refresh queue va `useCore` bilan bog‘langan xatolik xabarlari orqali abstraksiyalangan; servislar (`src/services/modules/**`) shu instansiyaning yordamchi funksiya sifatidagi mixinlaridan foydalangan holda Pinia actionlariga ulab beriladi.
- **Komponent dizayni** `components/base-components` va `components/layouts` atomic approach’ni ko‘rsatadi: Ant Design ustiga qurilgan button, modal, drawer, table, breadcrumb va loader kabi qayta ishlatiladigan atomlar; yuqori darajadagi Layout komponentlari (navbar, sidebar) router child’larini slotlar orqali joylashtiradi.
- **Marshrutlash va guard’lar** `src/routers/index.js` rollarga asoslangan `beforeEnter` bilan `/dashboard` subtree’ni himoyalaydi, meta roliga mos reroutelar va `i18n` bilan sarlavha boshqaruvi qo‘llaniladi; router fabrikasi i18n ni beforeEach ichida injekt qiladi.

```23:109:src/routers/index.js
        {
            path: '/dashboard',
            name: 'DashboardView',
            component: DashboardView,
            beforeEnter: (to, from, next) => {
                const userRole = localStorage.getItem('org_store_role')
                if (userRole === to.meta?.role) {
                    return next();
                } else if (userRole === "EMPLOYEE") {
                    return next({name: "MyStatistics"});
                } else if (userRole === "ORG_ADMIN") {
                    return next({name: "Statistics"})
                } else {
                    return next({path: ''})
                }
            },
```

- **UI va stil** `main.js` da Ant Design Vue, i18n, Pinia va router birlashtirilgan; `styles/main.scss` Tailwind’ni SCSS modul tizimi (mixins, ant override, responsive, feature-specific SCSS) bilan birgalikda ishlatadi, shuningdek Ant Design reset CSS import qilingan.

```1:34:src/main.js
import {createApp} from 'vue';
import 'ant-design-vue/dist/reset.css';
import '@/styles/main.scss';
import {createPinia} from "pinia";
...
app.use(Antd);
```

```1:19:src/styles/main.scss
@tailwind base;
@tailwind components;
@tailwind utilities;
...
body {
  color: #273444;
}
```

- **Global App xulqi** `App.vue` toast va loader’larni `useCore` dan `storeToRefs` orqali kuzatadi, `LoaderComponent` slot orqali `router-view` ni o‘rab oladi, `dayjs` lokalizatsiyasi shu yerda sozlangan.

```27:60:src/App.vue
watch(toastContent, () => {
  if (toastContent.value) {
    const toastMessage = toastContent.value || null;
    const type = toastContent.value.type || 'success'
    const messageText = toastMessage.locale ? t(toastMessage.locale) : toastMessage.message

    if (type === "error") {
      return message.error(messageText);
    }
    ...
  }
});
```

- **Pinia pattern** har bir store’da katta `state` obyektlari, servis bilan ishlovchi action’lar, helper funksiyalar (`checkChange`, `findAndUpdate`) va `useCore` bilan loading/notification sinxronlashgan.

```6:341:src/store/employee/employees.pinia.js
const useEmployee = defineStore('employee', {
    state: () => ({
        employee: {},
        employees: [],
        ...
    }),
    actions: {
        clearEmployees() { ... },
        getOneEmployee(employeeId, callback) { ... },
        getAllEmployees(...) { ... },
        ...
    }
})
```

- **Axios servis patterni** `setLoading`/`deleteLoading` composable’lari bilan birga ishlaydi; servis obyektlari (`projects.service.js`) Pinia store kontekstida `this` orqali shared state’ga yozish uchun mixin sifatida import qilinishi mo‘ljallangan.

```5:120:src/services/modules/employee/projects.service.js
export default {
    getAllProjects({page = 0, size = this.size, status, search} = {}) {
        this.page = page
        const core = useCore();
        setLoading('project/all')

        api({
            url: 'project/me',
            params: { page, size, status, search }
        })
            .then(({data}) => {
                this.projects = data.content;
                ...
            })
            .finally(() => {
                deleteLoading('project/all')
            })
    },
```

## SMS Implementation Roadmap (mavjud patternlarga tayangan holda)

### Phase 0 — Muvofiqlik va tayyorgarlik
- **Bootstrap**: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js` mavjud nusxa; yangi SMS uchun shu fayllarni o‘zgartirmasdan qoldiring, faqat env o‘zgaruvchilarini moslang.
- **I18n va Day.js**: `src/utils/i18n` va `dayjs` sozlamalarini o‘zgartirmang, SMS terminologiyasini mavjud `uz/ru` fayllariga qo‘shing (o‘sha formatda).

### Phase 1 — Core arxitektura
- **Routing skeleton**: `src/routers/index.js` dagi guardlarni qayta ishlatib, `/dashboard` ichida `admin`, `teacher`, `student` subtree’larini role meta bilan qurish; guard logikasi aynan shu fayldagi patternni takrorlasin.
- **Layouts va navigation**: `src/components/layouts/navbar` va `sidebar-menu` komponentlarini ko‘chirib, SMS tematik ikonlar bilan moslashtiring; Ant Design `a-layout` strukturasini saqlang.
- **Core store**: `src/store/core.pinia.js` ni aynan shu funksionallik bilan saqlab, SMS bo‘yicha qo‘shimcha global holatlar (masalan, “currentAcademicYear”) ni shu pattern bilan qo‘shing.
- **Composables**: `setLoading/deleteLoading`, `useQueryParams`, `useRouterHistoryCounter` larni aynan shu fayllardan import qilib yangi sahifalarda ham qo‘llash.

### Phase 2 — State management qatlamlari
- **Auth & Session**: `src/store/auth.pinia.js`, `user.pinia.js`, `user-org-store.pinia.js`, `session.pinia.js` patternlaridan foydalanib SMS uchun `auth`, `organizations`, `sessions` do‘konlarini mos endpointlarga ulang (masalan, `student/login`).
- **Role-based stores**:
  - `src/store/employee/employees.pinia.js` ni “StudentStore” va “TeacherStore” ga asos qilib, `fullModel`, `copyModel` va `checkChange` patternini saqlang.
  - `src/store/department.pinia.js`, `position.pinia.js`, `structures.pinia.js` lardagi hierarchical state patternini `CourseStore`, `ClassStore` uchun qayta ishlating.
- **Assessment & grading**: KPI yoki statistics store’larga o‘xshash tarzda `grading` va `attendance` do‘konlarini to‘plang, `useCore().setToast` va `loadingUrl` setlaridan foydalaning.

### Phase 3 — Networking va servislar
- **API layer**: `src/utils/api/index.js` instansiyasini bevosita ishlating; SMS endpointlari uchun faqat `baseURL` ni env orqali almashtiring.
- **Modul servislar**: Har bir yirik domen (Courses, Classes, Grades) uchun `src/services/modules/<domain>` papkasi ochib, `projects.service.js` dagi mixin patternini takrorlang; `setLoading/deleteLoading` bilan bir xil token/headers jarayonidan foydalaning.
- **File uploads**: Talaba hujjatlari uchun `useCore().fileUpload` metodini qayta ishlatib, `BasePictureViewer` va `BaseDrawer` integratsiyasini saqlang.

### Phase 4 — UI komponentlari va sahifalar
- **Qayta foydalaniladigan bazaviy komponentlar**: Avval `BaseButton`, `BaseTable`, `BaseDrawer`, `BaseBreadcrumb`, `BaseTag`, `BaseRangePicker`, `BaseDatePicker`, `BaseIcon`, `LoaderComponent`, `PageHeaderComponent`, `CustomPagination`, `PhoneNumberInput`, `ScrollbarComponent` larni port qiling — ular SMS sahifalarining asosiy UX bloklari bo‘ladi.
- **Dashboard sahifalari**:
  - **Admin**: `Client` dashboard patterni asosida Courses, Classes, Users modullarini `src/pages/dashboard/Admin/**` tarzida tashkil qiling; har modul ichida `components`, `modules`, `forms` papkalarini saqlang.
  - **Teacher**: `Employee/projects` sahifasidagi nested routing va modal flow’larni takrorlab, sinf ro‘yxati, topshiriqlar va baholash UI’larini yarating.
  - **Student**: `Employee/my-statistics` sahifasidagi charts (ApexCharts) patternini `StudentDashboard` ga moslashtiring, `BaseCardPicker` va `EmployeeActivity` kabi UI atomlaridan foydalaning.
- **Grading UI**: `BaseTable` + `SelectableRadio` ni baho kiritish uchun; Drawer orqali tafsilotlar ochish (core drawer patterni) va `BaseModal` larni assignment tasdiqlash uchun qo‘llang.
- **Course/Class forms**: `EmployeeForm` strukturasini ko‘chirib, `fullModel` va `copyModel` bilan Ant form + Pinia store’larni bog‘lang.

### Phase 5 — Routing & Guards detali
- **Role metas**: `admin`, `teacher`, `student` dashboard child’larini meta.role bilan belgilab, `beforeEnter` ni mos ravishda `org_store_role` o‘rniga `sms_role` kabi localStorage kalitiga qarating.
- **Redirect flows**: `useCore().redirect` va `router.push` patternini SMS login va unauthorized flow’lari uchun ishlating; i18n sarlavhalarini `router.beforeEach` da yangilang.

### Phase 6 — UI/Styling yakunlash
- **Tailwind + SCSS**: `styles/main.scss` dagi import ketma-ketligini saqlab, SMS ga xos SCSS modullarini `styles/features/<module>.scss` da saqlang.
- **Ant Design temasi**: `src/utils/ant/theme.js` ni yangilab, maktab brendingiga mos primary rang qo‘ying; ammo `a-config-provider` patternini o‘zgartirmang.
- **Responsive**: Mavjud breakpoint SCSS va Tailwind utility’laridan foydalangan holda mobile-first dashboards yarating; `useCore().windowWidth` ni sidebar collapse’lari uchun qo‘llang.

### Phase 7 — Qo‘shimcha imkoniyatlar
- **Notifications**: `useCore().setToast` va `message.*` integratsiyasini baho kiritish, kurs yaratish jarayonlarida bir xil uslubda ishlating.
- **Breadcrumbs**: `core.breadcrumb` dan foydalangan holda Courses → Class → Student nav chain’larini `BaseBreadcrumb` ga berish.
- **History & filters**: `useQueryParams` composable’ini kurs va baho filtrlariga ulash, `CustomPagination` bilan state sinxronlash.

## Qayta foydalanilishi shart bo‘lgan komponentlar / helperlar
- UI: `BaseButton`, `BaseTable`, `BaseDrawer`, `BaseModal` lar (`components/base-components/modal`), `BaseBreadcrumb`, `LoaderComponent`, `PageHeaderComponent`, `CustomPagination`, `BaseDatePicker`, `BaseRangePicker`, `BaseIcon`, `LogoComponent`.
- Layout: `components/layouts/navbar/**`, `components/layouts/sidebar-menu/**`, `DashboardView` ning skeleti.
- Composables: `setLoading/deleteLoading`, `useQueryParams`, `useRouterHistoryCounter`, `browserStorage` helperlari, `sessionStorage` breadcrumb saqlash.
- Stores: `core.pinia.js`, `auth.pinia.js`, `session.pinia.js`, `user.pinia.js` — aynan shu pattern bilan SMS do‘konlarini qurish.
- Services: `utils/api/index.js` instansiyasi va `services/modules` dagi mixin yondashuvi.
- Styles: `styles/main.scss`, `ant.scss`, `responsive`, `variable.scss` fayllaridagi struktura.

Agar faylga yozish imkoniyati kerak bo‘lsa, agent rejimini yoqing yoki qayta xabar bering — shunda rejaning aynan o‘zi `*.md` fayliga yozib beraman.