/**
 * Hafta kunlari konstantalari
 * Barcha komponentlarda qayta ishlatish uchun markazlashtirilgan joy
 */

/**
 * Hafta kunlari ro'yxati (Ant Design Select uchun format)
 * @type {Array<{label: string, value: string}>}
 */
export const WEEK_DAY_OPTIONS = [
    { label: "Dushanba", value: "MONDAY" },
    { label: "Seshanba", value: "TUESDAY" },
    { label: "Chorshanba", value: "WEDNESDAY" },
    { label: "Payshanba", value: "THURSDAY" },
    { label: "Juma", value: "FRIDAY" },
    { label: "Shanba", value: "SATURDAY" },
    { label: "Yakshanba", value: "SUNDAY" },
  ];
  
  /**
   * Hafta kunlari nomlari (key-value mapping)
   */
  export const WEEK_DAY_NAMES = {
    MONDAY: "Dushanba",
    TUESDAY: "Seshanba",
    WEDNESDAY: "Chorshanba",
    THURSDAY: "Payshanba",
    FRIDAY: "Juma",
    SATURDAY: "Shanba",
    SUNDAY: "Yakshanba",
  };
  
  /**
   * Hafta kuni qiymatini label'ga o'girish
   * @param {string} dayValue - Hafta kuni qiymati (masalan: "MONDAY")
   * @returns {string} - Hafta kuni nomi (masalan: "Dushanba")
   */
  export const getWeekDayLabel = (dayValue) => {
    return WEEK_DAY_NAMES[dayValue] || dayValue;
  };