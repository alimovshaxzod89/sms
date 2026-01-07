<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- Left decorative section -->
      <div class="login-left">
        <div class="decorative-content">
          <div class="logo-container">
            <div class="logo-circle">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M40 10L50 30H70L55 45L60 65L40 55L20 65L25 45L10 30H30L40 10Z"
                  fill="currentColor"
                  opacity="0.9"
                />
                <circle cx="40" cy="40" r="8" fill="white" />
              </svg>
            </div>
          </div>
          <h2 class="welcome-title">Xush kelibsiz!</h2>
          <p class="welcome-subtitle">Ta'lim boshqaruv tizimiga</p>
          <div class="decorative-elements">
            <div class="decorative-circle circle-1"></div>
            <div class="decorative-circle circle-2"></div>
            <div class="decorative-circle circle-3"></div>
            <div class="decorative-line line-1"></div>
            <div class="decorative-line line-2"></div>
          </div>
        </div>
      </div>

      <!-- Right form section -->
      <div class="login-right">
        <div class="login-card">
          <div class="login-header">
            <h1>Tizimga kirish</h1>
            <p>Ma'lumotlaringizni kiriting</p>
          </div>

          <a-form
            :model="formState"
            :rules="rules"
            @finish="handleSubmit"
            @finishFailed="handleError"
            layout="vertical"
            class="login-form"
          >
            <a-form-item label="Rol" name="role">
              <a-select
                v-model:value="formState.role"
                placeholder="Rolni tanlang"
                size="large"
                class="custom-select"
              >
                <a-select-option value="admin">Admin</a-select-option>
                <a-select-option value="teacher">O'qituvchi</a-select-option>
                <a-select-option value="student">O'quvchi</a-select-option>
                <a-select-option value="parent">Ota-ona</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="Foydalanuvchi nomi" name="username">
              <a-input
                v-model:value="formState.username"
                placeholder="Foydalanuvchi nomini kiriting"
                size="large"
                class="custom-input"
              >
                <template #prefix>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
                      fill="currentColor"
                      opacity="0.5"
                    />
                    <path
                      d="M8 10C4.68629 10 2 12.6863 2 16H14C14 12.6863 11.3137 10 8 10Z"
                      fill="currentColor"
                      opacity="0.5"
                    />
                  </svg>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="Parol" name="password">
              <a-input-password
                v-model:value="formState.password"
                placeholder="Parolni kiriting"
                size="large"
                class="custom-input"
              >
                <template #prefix>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 0C5.23858 0 3 2.23858 3 5V7C1.89543 7 1 7.89543 1 9V13C1 14.1046 1.89543 15 3 15H13C14.1046 15 15 14.1046 15 13V9C15 7.89543 14.1046 7 13 7V5C13 2.23858 10.7614 0 8 0ZM8 2C9.65685 2 11 3.34315 11 5V7H5V5C5 3.34315 6.34315 2 8 2Z"
                      fill="currentColor"
                      opacity="0.5"
                    />
                  </svg>
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                block
                :loading="authStore.isLoading"
                class="login-button"
              >
                <span v-if="!authStore.isLoading">Kirish</span>
              </a-button>
            </a-form-item>
          </a-form>

          <div v-if="errorMessage" class="error-message">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM8 10C7.44772 10 7 10.4477 7 11C7 11.5523 7.44772 12 8 12C8.55228 12 9 11.5523 9 11C9 10.4477 8.55228 10 8 10ZM7 4H9V8H7V4Z"
                fill="currentColor"
              />
            </svg>
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/store/auth/auth.pinia";
import { message } from "ant-design-vue";

const router = useRouter();
const authStore = useAuth();

const formState = reactive({
  username: "",
  password: "",
  role: "admin",
});

const errorMessage = ref("");

const rules = {
  username: [
    {
      required: true,
      message: "Foydalanuvchi nomini kiriting",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "Parolni kiriting", trigger: "blur" },
    {
      min: 6,
      message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
      trigger: "blur",
    },
  ],
  role: [{ required: true, message: "Rolni tanlang", trigger: "change" }],
};

const handleSubmit = async () => {
  errorMessage.value = "";

  try {
    const result = await authStore.login(formState);

    if (result.success) {
      message.success("Muvaffaqiyatli kirdingiz!");

      // Rolga mos dashboard'ga yo'naltirish
      const roleRouteMap = {
        admin: "AdminDashboard",
        teacher: "TeacherDashboard",
        student: "StudentDashboard",
        parent: "ParentDashboard",
      };

      const routeName = roleRouteMap[result.user.role] || "AdminDashboard";
      router.push({ name: routeName });
    } else {
      errorMessage.value = result.error || "Kirishda xatolik yuz berdi";
      message.error(errorMessage.value);
    }
  } catch (error) {
    errorMessage.value = "Kutilmagan xatolik yuz berdi";
    message.error(errorMessage.value);
  }
};

const handleError = (errorInfo) => {
  console.log("Validation failed:", errorInfo);
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 0;
  overflow: hidden;
}

.login-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

/* Left decorative section */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #ffffff 0%, #f0f4f8 50%, #e8f0f5 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  overflow: hidden;
}

.decorative-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 500px;
}

.logo-container {
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
}

.logo-circle {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(74, 144, 226, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.welcome-title {
  font-size: 42px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 18px;
  color: #64748b;
  font-weight: 400;
  margin-bottom: 0;
}

/* Decorative elements */
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.decorative-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(74, 144, 226, 0.08);
  animation: pulse 4s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  animation-delay: 1s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 10%;
  animation-delay: 2s;
}

.decorative-line {
  position: absolute;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(74, 144, 226, 0.1),
    transparent
  );
  animation: slide 6s ease-in-out infinite;
}

.line-1 {
  width: 400px;
  height: 2px;
  top: 20%;
  left: -200px;
  transform: rotate(45deg);
  animation-delay: 0s;
}

.line-2 {
  width: 300px;
  height: 2px;
  bottom: 30%;
  right: -150px;
  transform: rotate(-45deg);
  animation-delay: 3s;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.3;
  }
}

@keyframes slide {
  0% {
    transform: translateX(-100px) rotate(45deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(600px) rotate(45deg);
    opacity: 0;
  }
}

/* Right form section */
.login-right {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
}

.login-right::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #4a90e2 0%, #357abd 100%);
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.login-header p {
  color: #64748b;
  font-size: 15px;
  font-weight: 400;
}

.login-form {
  margin-top: 8px;
}

.login-form :deep(.ant-form-item-label > label) {
  color: #334155;
  font-weight: 500;
  font-size: 14px;
}

.custom-input :deep(.ant-input),
.custom-select :deep(.ant-select-selector) {
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  transition: all 0.3s ease;
}

.custom-input :deep(.ant-input):hover,
.custom-select :deep(.ant-select-selector):hover {
  border-color: #4a90e2;
}
.custom-input :deep(.ant-input),
.custom-input :deep(.ant-input-password){
  border: none !important;
}

.custom-input :deep(.ant-input):focus,
.custom-input :deep(.ant-input-focused),
.custom-select :deep(.ant-select-focused .ant-select-selector) {
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.custom-input :deep(.ant-input-prefix) {
  color: #94a3b8;
  margin-right: 12px;
}

.login-button {
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  transition: all 0.3s ease;
  margin-top: 8px;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4);
  background: linear-gradient(135deg, #357abd 0%, #2a5f94 100%);
}

.login-button:active {
  transform: translateY(0);
}

.error-message {
  margin-top: 20px;
  padding: 14px 16px;
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.error-message svg {
  flex-shrink: 0;
}

/* Responsive design */
@media (max-width: 968px) {
  .login-wrapper {
    flex-direction: column;
  }

  .login-left {
    min-height: 300px;
    padding: 40px 20px;
  }

  .welcome-title {
    font-size: 32px;
  }

  .welcome-subtitle {
    font-size: 16px;
  }

  .logo-circle {
    width: 100px;
    height: 100px;
  }

  .logo-circle svg {
    width: 60px;
    height: 60px;
  }

  .login-right {
    padding: 30px 20px;
  }

  .login-right::before {
    display: none;
  }
}

@media (max-width: 480px) {
  .login-left {
    min-height: 250px;
    padding: 30px 20px;
  }

  .welcome-title {
    font-size: 28px;
  }

  .login-header h1 {
    font-size: 26px;
  }

  .login-card {
    padding: 0;
  }
}
</style>
