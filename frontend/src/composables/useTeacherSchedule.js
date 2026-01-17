import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/store/auth/auth.pinia'
import { getLessons } from '@/services/modules/lessons/lessons.service'
import dayjs from 'dayjs'

/**
 * Teacher schedule composable
 * 
 * Bu composable teacherning darslarini olish va 
 * Vue Cal uchun formatlash uchun javobgar
 */
export function useTeacherSchedule() {
  const authStore = useAuth()
  const lessons = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Joriy haftaning dushanba kunini topish
   */
  const getMonday = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  // Haftaning dushanba kuni - ref orqali reactive qilish
  const monday = ref(getMonday(new Date()))

  /**
   * Hafta kunlari uchun sanalarni hisoblash
   */
  const getWeekDate = (dayOffset) => {
    const date = new Date(monday.value)
    date.setDate(monday.value.getDate() + dayOffset)
    return dayjs(date).format('YYYY-MM-DD')
  }

  /**
   * Backend'dan kelgan day formatini hafta offset'iga o'tkazish
   * MONDAY -> 0, TUESDAY -> 1, etc.
   */
  const dayToOffset = {
    'MONDAY': 0,
    'TUESDAY': 1,
    'WEDNESDAY': 2,
    'THURSDAY': 3,
    'FRIDAY': 4,
    'SATURDAY': 5,
    'SUNDAY': 6
  }

  /**
   * Subject nomiga asosan CSS class nomini yaratish
   */
  const getSubjectClass = (subjectName) => {
    if (!subjectName) return 'subject-default'
    
    const name = subjectName.toLowerCase()
    if (name.includes('matematik')) return 'subject-math'
    if (name.includes('ingliz')) return 'subject-english'
    if (name.includes('biolog')) return 'subject-biology'
    if (name.includes('fizik')) return 'subject-physics'
    if (name.includes('kimyo')) return 'subject-chemistry'
    if (name.includes('tarix')) return 'subject-history'
    
    return 'subject-default'
  }

  /**
   * Lesson ma'lumotlarini Vue Cal event formatiga o'tkazish
   */
  const transformLessonToEvent = (lesson) => {
    const dayOffset = dayToOffset[lesson.day]
    
    if (dayOffset === undefined || !lesson.startTime || !lesson.endTime) {
      return null
    }

    const date = getWeekDate(dayOffset)
    const startTime = lesson.startTime // "08:00" format
    const endTime = lesson.endTime     // "08:45" format

    // Subject name va Lesson name'ni birlashtirish
    const subjectName = lesson.subjectId?.name || ''
    const lessonName = lesson.name || ''
    
    let title = ''
    if (subjectName && lessonName) {
      title = `${subjectName} - ${lessonName}`
    } else if (subjectName) {
      title = subjectName
    } else if (lessonName) {
      title = lessonName
    } else {
      title = 'Dars'
    }

    return {
      start: `${date} ${startTime}`,
      end: `${date} ${endTime}`,
      title: title,
      class: getSubjectClass(lesson.subjectId?.name || lesson.name),
      // Qo'shimcha ma'lumotlar uchun
      lessonId: lesson._id || lesson.id,
      classId: lesson.classId?._id || lesson.classId,
      className: lesson.classId?.name || 'Noma\'lum sinf',
      lessonName: lessonName,
      subjectName: subjectName
    }
  }

  /**
   * Teacher lessons'ni yuklash
   */
  const fetchTeacherLessons = async () => {
    // Faqat teacher roli uchun ishlash
    if (authStore.role !== 'teacher') {
      error.value = 'Teacher ma\'lumotlari topilmadi'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Backend avtomatik teacher ID bo'yicha filter qiladi
      const result = await getLessons({
        page: 1,
        limit: 100 // Barcha lessonlarni olish uchun
      })

      if (result.success) {
        // Faqat schedule (day, startTime, endTime) bo'lgan lessonlarni filter qilish
        lessons.value = result.data.filter(lesson => 
          lesson.day && lesson.startTime && lesson.endTime
        )
      } else {
        error.value = result.error || 'Darslarni yuklashda xatolik yuz berdi'
        lessons.value = []
      }
    } catch (err) {
      error.value = err.message || 'Darslarni yuklashda xatolik yuz berdi'
      lessons.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Vue Cal uchun formatlangan eventlar
   * Yakshanba (SUNDAY) kunidagi eventlar chiqarilmaydi
   */
  const scheduleEvents = computed(() => {
    return lessons.value
      .filter(lesson => lesson.day !== 'SUNDAY') // Yakshanbani filtrlash
      .map(transformLessonToEvent)
      .filter(Boolean) // null va undefined'larni filter qilish
  })

  /**
   * Hafta oralig'ini ko'rsatish uchun
   */
  const dateRangeText = computed(() => {
    const start = dayjs(monday.value).format('MMMM D')
    const end = dayjs(monday.value).add(5, 'day').format('D')
    return `${start} - ${end}`
  })

  // Komponent mount bo'lganda avtomatik yuklash
  onMounted(() => {
    fetchTeacherLessons()
  })

  return {
    // State
    isLoading,
    error,
    
    // Computed
    scheduleEvents,
    dateRangeText,
    
    // Methods
    fetchTeacherLessons
  }
}