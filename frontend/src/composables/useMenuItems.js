import { computed } from "vue";
import { useAuth } from "@/store/auth/auth.pinia";
import { menuItemsConfig } from "@/config/menuItems";
import { filterMenuItemsByRole, normalizeRole } from "@/utils/helpers/menuHelper";

/**
 * Reactive menu items composable
 * Role o'zgarganda avtomatik yangilanadi
 */
export function useMenuItems() {
  const authStore = useAuth();

  // Computed property - role o'zgarganda avtomatik yangilanadi
  const menuItems = computed(() => {
    const userRole = normalizeRole(authStore.userRole || authStore.role);
    
    if (!userRole) {
      return [];
    }

    return filterMenuItemsByRole(menuItemsConfig, userRole);
  });

  return {
    menuItems,
  };
}