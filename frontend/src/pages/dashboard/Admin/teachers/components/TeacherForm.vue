<template>
  <div class="p-2">
    <a-form 
      ref="formRef" 
      :model="formState" 
      layout="vertical"
    >
      <a-form-item
        label="F.I.O"
        name="name"
        :rules="[{ required: true, message: 'Please input your F.I.O' }]"
      >
        <a-input v-model:value="formState.name" />
      </a-form-item>
      <a-form-item
        label="Email"
        name="email"
        :rules="[
          { required: true, message: 'Please input your email' },
          { type: 'email', message: 'Please input a valid email' },
        ]"
      >
        <a-input v-model:value="formState.email" />
      </a-form-item>
      <a-form-item
        label="Phone"
        name="phone"
        :rules="[{ required: true, message: 'Please input your phone' }]"
      >
        <a-input v-model:value="formState.phone" />
      </a-form-item>
      <a-form-item
        label="Manzil"
        name="address"
        :rules="[{ required: true, message: 'Please input your address' }]"
      >
        <a-input v-model:value="formState.address" />
      </a-form-item>
      <div class="flex justify-end gap-2">
        <a-button @click="emit('cancel')" :disabled="loading">
          Bekor qilish
        </a-button>
        <a-button
          class="bg-blue-600 text-white hover:bg-blue-700"
          type="primary"
          @click="handleSubmit"
          :disabled="loading"
        >
          {{ mode === "create" ? "Yaratish" : "Saqlash" }}
        </a-button>
      </div>
    </a-form>
  </div>
</template>
<script setup>
// 1. Imports - Vue core
import { ref, watch } from "vue";

// 2. Props
const props = defineProps({
  mode: {
    type: String,
    default: "create", // create or edit
  },
  loading: {
    type: Boolean,
    default: false,
  },
  teacher: {
    type: Object,
    default: () => ({
      name: "",
      email: "",
      phone: "",
      address: "",
    }),
  },
});

// 3. Emits
const emit = defineEmits(["cancel", "submit"]);

// 4. Reactive State
const formRef = ref(null);
const formState = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
});

// 5. Methods
/**
 * Formani tozalash
 */
const resetForm = () => {
  formState.value = {
    name: "",
    email: "",
    phone: "",
    address: "",
  };
  formRef.value?.resetFields();
};

/**
 * Formani teacher ma'lumotlari bilan to'ldirish
 * @param {Object} teacher - O'qituvchi ma'lumotlari
 */
const populateForm = (teacher) => {
  if (teacher && Object.keys(teacher).length > 0) {
    formState.value = {
      name: teacher.name || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      address: teacher.address || "",
    };
  } else {
    resetForm();
  }
};

/**
 * Form submit qilish
 */
const handleSubmit = () => {
  formRef.value
    ?.validate()
    .then(() => {
      emit("submit", formState.value);
    })
    .catch((error) => {
      console.error("Form validation error:", error);
    });
};

// 6. Watchers
/**
 * Props o'zgarganda formState ni yangilash
 */
watch(
  () => props.teacher,
  (newTeacher) => {
    populateForm(newTeacher);
  },
  { immediate: true, deep: true }
);

/**
 * Mode o'zgarganda ham formani tozalash
 */
watch(
  () => props.mode,
  (newMode) => {
    if (newMode === "create") {
      resetForm();
    }
  }
);
</script>
<style scoped></style>
