<template>
  <a-menu
    :items="pages"
    style="background-color: transparent; border: none"
    mode="inline"
    @click="handleClickMenu"
  />
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/store/auth/auth.pinia";
import { useMenuItems } from "@/composables/useMenuItems";


const router = useRouter();
const route = useRoute();
const authStore = useAuth();
const { menuItems } = useMenuItems();

const pages = computed(() => menuItems.value);

const emit = defineEmits(["menu-click"]);

function handleClickMenu({ item }) {
  const { path, name } = item;

  // Logout bo'lsa, logout funksiyasini chaqirish
  if (name === "Logout") {
    handleLogout();
    return;
  }

  // Boshqa menu itemlar uchun oddiy navigation
  if (name !== route.name && path) {
    router.push(`/dashboard/${path}`);
  }
  emit("menu-click");
}

async function handleLogout() {
  try {
    await authStore.logout();
    // Logout muvaffaqiyatli bo'lgandan keyin login sahifasiga yo'naltirish
    router.push("/");
  } catch (error) {
    console.error("Logout xatosi:", error);
    // Xatolik bo'lsa ham login sahifasiga yo'naltirish
    router.push("/");
  }
}
</script>

<style scoped></style>
