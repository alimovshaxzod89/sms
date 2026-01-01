<template>
  <div class="p-2">
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-form-item
        label="Title"
        name="title"
        :rules="[{ required: true, message: 'Please input your title' }]"
      >
        <a-input v-model:value="formState.title" />
      </a-form-item>
      <a-form-item
        label="Description"
        name="description"
        :rules="[{ required: true, message: 'Please input your description' }]"
      >
        <a-textarea v-model:value="formState.description" />
      </a-form-item>
      <div class="flex gap-2">
        <a-form-item
          label="Start Time"
          name="startTime"
          class="flex-1"
          :rules="[{ required: true, message: 'Please input your start time' }]"
        >
          <a-date-picker v-model:value="formState.startTime" class="w-[100%]" />
        </a-form-item>
        <a-form-item
          label="End Time"
          name="endTime"
          class="flex-1"
          :rules="[{ required: true, message: 'Please input your end time' }]"
        >
          <a-date-picker v-model:value="formState.endTime" class="w-[100%]" />
        </a-form-item>
      </div>
      <a-form-item
        label="Class"
        name="classId"
        :rules="[{ required: false, message: 'Please select a class' }]"
      >
        <a-select
          v-model:value="formState.classId"
          :loading="loadingClasses"
          placeholder="Select a class"
          allow-clear
        >
          <a-select-option
            v-for="classItem in classes"
            :key="classItem._id"
            :value="classItem._id"
          >
            {{ classItem.name }}
          </a-select-option>
        </a-select>
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
import { onMounted, ref, watch } from "vue";

// 2. Imports - Third-party libraries
import dayjs from "dayjs";

// 3. Imports - Services
import { getClasses } from "@/services/modules/classes/classes.service";

// 4. Props
const props = defineProps({
  mode: {
    type: String,
    default: "create", // create or edit
  },
  loading: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Object,
    default: () => ({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      classId: "",
    }),
  },
});

// 5. Emits
const emit = defineEmits(["submit", "cancel"]);

// 6. Reactive State
const formRef = ref(null);
const formState = ref({
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  classId: "",
});

const classes = ref([]);
const loadingClasses = ref(false);

// 7. Methods
/**
 * Formani tozalash
 */
const resetForm = () => {
  formState.value = {
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    classId: "",
  };
  formRef.value?.resetFields();
};

/**
 * Sana va vaqtni birlashtirib dayjs obyektiga o'girish
 * @param {string} date - Sana string formatida (masalan: "01.01.2026")
 * @param {string} time - Vaqt string formatida (masalan: "17:00")
 * @returns {dayjs|null} - dayjs obyekti yoki null
 */
const combineDateAndTime = (date, time) => {
  if (!date || !time) return null;

  try {
    // Sana formatini parse qilish (DD.MM.YYYY)
    const parsedDate = dayjs(date, "DD.MM.YYYY");

    // Vaqt formatini parse qilish (HH:mm)
    const [hours, minutes] = time.split(":").map(Number);

    // Sana va vaqtni birlashtirish
    return parsedDate
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0);
  } catch (error) {
    console.error("Date va time ni parse qilishda xatolik:", error);
    return null;
  }
};

/**
 * Formani event ma'lumotlari bilan to'ldirish
 * @param {Object} event - Event ma'lumotlari
 */
const populateForm = (event) => {
  if (event && Object.keys(event).length > 0) {
    formState.value = {
      title: event.title,
      description: event.description,
      startTime: combineDateAndTime(event.date, event.startTime),
      endTime: combineDateAndTime(event.date, event.endTime),
      classId: event.classId ? event.classId._id : "",
    };
  } else {
    resetForm();
  }
};

/**
 * Classlar ro'yxatini yuklash
 */
const loadClasses = async () => {
  if (classes.value.length === 0) {
    loadingClasses.value = true;
    try {
      const result = await getClasses({
        page: 1,
        limit: 100,
      });
      if (result.success) {
        classes.value = result.data;
      }
    } catch (error) {
      console.error("Classlarni yuklashda xatolik:", error);
      classes.value = [];
    } finally {
      loadingClasses.value = false;
    }
  }
};

/**
 * Form submit qilish
 */
const handleSubmit = () => {
  formRef.value
    ?.validate()
    .then(() => {
      // dayjs obyektlarini ISO string formatiga o'girish
      const submitData = {
        ...formState.value,
        startTime: formState.value.startTime
          ? dayjs(formState.value.startTime).toISOString()
          : null,
        endTime: formState.value.endTime
          ? dayjs(formState.value.endTime).toISOString()
          : null,
      };
      emit("submit", submitData);
    })
    .catch((error) => {
      console.error("Form validation error:", error);
    });
};

// 8. Watchers
/**
 * Props o'zgarganda formState ni yangilash
 */
watch(
  () => props.event,
  (newEvent) => {
    populateForm(newEvent);
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

// 9. Lifecycle Hooks
/**
 * Component mount bo'lganda classlar ro'yxatini yuklash
 */
onMounted(() => {
  loadClasses();
});
</script>
<style scoped></style>
