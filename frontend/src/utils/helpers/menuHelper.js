/**
 * Menu items'ni role asosida filtrlash va transformatsiya qilish
 * @param {Array} menuConfig - Menu items konfiguratsiyasi
 * @param {string} userRole - Foydalanuvchi roli (lowercase: 'admin', 'teacher', 'student', 'parent')
 * @returns {Array} - Filtrlangan va transformatsiya qilingan menu items
 */
export function filterMenuItemsByRole(menuConfig, userRole) {
    if (!userRole || !menuConfig) {
      return [];
    }
  
    // Role'ni lowercase qilish (ta'minlash uchun)
    const normalizedRole = userRole.toLowerCase();
  
    return menuConfig
      .map((group) => {
        // Har bir group ichidagi items'larni filtrlash
        const filteredItems = group.items.filter((item) => {
          // visible array'da mavjud bo'lsa true qaytaradi
          return item.visible?.includes(normalizedRole) ?? false;
        });
  
        // Agar filtered items bo'sh bo'lsa, butun group'ni o'tkazib yuborish
        if (filteredItems.length === 0) {
          return null;
        }
  
        // Item'larni Ant Design Menu formatiga transformatsiya qilish
        return {
          type: "group",
          label: group.title,
          children: filteredItems.map((item) => {
            // Har bir role uchun to'g'ri path'ni olish
            const path = item.paths?.[normalizedRole] || "";
  
            return {
              path,
              key: item.key,
              icon: item.icon,
              label: item.label,
              name: item.name,
            };
          }),
        };
      })
      .filter((group) => group !== null); // null qiymatlarni olib tashlash
  }
  
  /**
   * Foydalanuvchi rolini normalized qilish
   * @param {string} role - Role (har qanday formatda: 'ADMIN', 'admin', 'Admin')
   * @returns {string} - Normalized role (lowercase)
   */
  export function normalizeRole(role) {
    if (!role) return null;
    return role.toLowerCase();
  }