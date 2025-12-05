<script setup>
import { ref, computed } from 'vue'
import { VueCal } from 'vue-cal'
import 'vue-cal/style.css'
import dayjs from 'dayjs'

const props = defineProps({
    classGroup: {
        type: String,
        default: '4A'
    }
})

const currentView = ref('week')

// Joriy haftaning dushanba kunini topish
const getMonday = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
    return new Date(d.setDate(diff))
}

const monday = getMonday(new Date())

// Hafta kunlari uchun sanalarni hisoblash
const getWeekDate = (dayOffset) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + dayOffset)
    return dayjs(date).format('YYYY-MM-DD')
}

// Hafta oralig'ini ko'rsatish uchun
const dateRangeText = computed(() => {
    const start = dayjs(monday).format('MMMM D')
    const end = dayjs(monday).add(4, 'day').format('D')
    return `${start} - ${end}`
})

// Dars jadvali ma'lumotlari - dinamik sanalar bilan
const scheduleData = computed(() => [
    // Dushanba (0)
    { start: `${getWeekDate(0)} 08:00`, end: `${getWeekDate(0)} 08:45`, title: 'Matematika', class: 'subject-math' },
    { start: `${getWeekDate(0)} 09:00`, end: `${getWeekDate(0)} 09:45`, title: 'Ingliz tili', class: 'subject-english' },
    { start: `${getWeekDate(0)} 10:00`, end: `${getWeekDate(0)} 10:45`, title: 'Biologiya', class: 'subject-biology' },
    { start: `${getWeekDate(0)} 11:00`, end: `${getWeekDate(0)} 11:45`, title: 'Fizika', class: 'subject-physics' },
    { start: `${getWeekDate(0)} 13:00`, end: `${getWeekDate(0)} 13:45`, title: 'Kimyo', class: 'subject-chemistry' },
    { start: `${getWeekDate(0)} 14:00`, end: `${getWeekDate(0)} 14:45`, title: 'Tarix', class: 'subject-history' },
    
    // Seshanba (1)
    { start: `${getWeekDate(1)} 09:00`, end: `${getWeekDate(1)} 09:45`, title: 'Ingliz tili', class: 'subject-english' },
    { start: `${getWeekDate(1)} 10:00`, end: `${getWeekDate(1)} 10:45`, title: 'Biologiya', class: 'subject-biology' },
    { start: `${getWeekDate(1)} 11:00`, end: `${getWeekDate(1)} 11:45`, title: 'Fizika', class: 'subject-physics' },
    { start: `${getWeekDate(1)} 14:00`, end: `${getWeekDate(1)} 14:45`, title: 'Tarix', class: 'subject-history' },
    
    // Chorshanba (2)
    { start: `${getWeekDate(2)} 08:00`, end: `${getWeekDate(2)} 08:45`, title: 'Matematika', class: 'subject-math' },
    { start: `${getWeekDate(2)} 10:00`, end: `${getWeekDate(2)} 10:45`, title: 'Biologiya', class: 'subject-biology' },
    { start: `${getWeekDate(2)} 13:00`, end: `${getWeekDate(2)} 13:45`, title: 'Kimyo', class: 'subject-chemistry' },
    
    // Payshanba (3)
    { start: `${getWeekDate(3)} 09:00`, end: `${getWeekDate(3)} 09:45`, title: 'Ingliz tili', class: 'subject-english' },
    { start: `${getWeekDate(3)} 10:00`, end: `${getWeekDate(3)} 10:45`, title: 'Biologiya', class: 'subject-biology' },
    { start: `${getWeekDate(3)} 11:00`, end: `${getWeekDate(3)} 11:45`, title: 'Fizika', class: 'subject-physics' },
    { start: `${getWeekDate(3)} 14:00`, end: `${getWeekDate(3)} 14:45`, title: 'Tarix', class: 'subject-history' },
    
    // Juma (4)
    { start: `${getWeekDate(4)} 08:00`, end: `${getWeekDate(4)} 08:45`, title: 'Matematika', class: 'subject-math' },
    { start: `${getWeekDate(4)} 09:00`, end: `${getWeekDate(4)} 09:45`, title: 'Ingliz tili', class: 'subject-english' },
    { start: `${getWeekDate(4)} 11:00`, end: `${getWeekDate(4)} 11:45`, title: 'Fizika', class: 'subject-physics' },
    { start: `${getWeekDate(4)} 13:00`, end: `${getWeekDate(4)} 13:45`, title: 'Kimyo', class: 'subject-chemistry' },
    { start: `${getWeekDate(4)} 14:00`, end: `${getWeekDate(4)} 14:45`, title: 'Tarix', class: 'subject-history' },
])

// Hafta/kun ko'rinishini almashtirish
const viewButtons = [
    { key: 'week', label: 'Hafta' },
    { key: 'day', label: 'Kun' }
]

const handleEventClick = (event) => {
    console.log('Dars tanlandi:', event)
}
</script>

<template>
    <div class="big-calendar-container">
        <!-- Header -->
        <div class="calendar-header">
            <h2 class="calendar-title">Dars jadvali ({{ classGroup }})</h2>
            
            <div class="calendar-controls">
                <span class="date-range">{{ dateRangeText }}</span>
                <div class="view-switcher">
                    <button 
                        v-for="btn in viewButtons"
                        :key="btn.key"
                        :class="['view-btn', { active: currentView === btn.key }]"
                        @click="currentView = btn.key"
                    >
                        {{ btn.label }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Calendar -->
            <vue-cal
            :events="scheduleData"
            :view="currentView"
            :views="['week', 'day']"
            :time-from="7 * 60 + 30"
            :time-to="16 * 60"
            :time-step="60"
            :time-cell-height="70"
            :hide-weekends="true"
            :twelve-hour="false"
            :title-bar="false"
            :views-bar="false"
            :sticky-split-days="false"
            locale="uz"
            @event-click="handleEventClick"
        />
    </div>
</template>

<style scoped>
.big-calendar-container {
    background: white;
    border-radius: 12px;
    padding: 16px 20px;
    height: 100%;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
}

.calendar-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
}

.calendar-controls {
    display: flex;
    align-items: center;
    gap: 12px;
}

.date-range {
    font-size: 0.8125rem;
    color: #6b7280;
    font-weight: 500;
}

.view-switcher {
    display: flex;
    background: #f3f4f6;
    border-radius: 6px;
    padding: 3px;
}

.view-btn {
    padding: 5px 14px;
    border: none;
    background: transparent;
    border-radius: 4px;
    font-size: 0.8125rem;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s ease;
}

.view-btn:hover {
    color: #374151;
}

.view-btn.active {
    background: #fef3c7;
    color: #92400e;
    font-weight: 500;
}

/* Vue Cal base styles */
:deep(.vuecal) {
    border: none;
    box-shadow: none;
    font-size: 0.8125rem;
    border-radius: 8px;
    overflow: visible;
    height: calc(100% - 60px);
}

:deep(.vuecal__header) {
    background: white;
    position: relative;
    z-index: 10;
}

:deep(.vuecal__weekdays-headings) {
    background: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 12px 0;
    margin-bottom: 0;
    position: relative;
    z-index: 10;
}

:deep(.vuecal__heading) {
    font-weight: 500;
    color: #374151;
    font-size: 0.8125rem;
    height: auto;
    padding: 6px 0;
    background: white;
}

:deep(.vuecal__body) {
    overflow: visible;
    margin-top: 0;
}

:deep(.vuecal__bg) {
    overflow: visible;
}

:deep(.vuecal__all-day) {
    display: none;
}

:deep(.vuecal__flex[column]) {
    position: relative;
}

:deep(.vuecal__time-column) {
    width: 56px;
    border-right: 1px solid #e5e7eb;
}

:deep(.vuecal__time-cell) {
    font-size: 0.6875rem;
    color: #9ca3af;
    text-align: right;
    padding-right: 8px;
}

:deep(.vuecal__cell) {
    border: 1px solid #f3f4f6;
}

:deep(.vuecal__cell:hover) {
    background: #fafafa;
}

:deep(.vuecal__cell--today) {
    background-color: #fefce8 !important;
}

:deep(.vuecal__now-line) {
    color: #ef4444;
}

:deep(.vuecal__now-line::before) {
    background: #ef4444;
}

/* Event styles */
:deep(.vuecal__event) {
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.75rem;
    border: none;
    margin: 2px 3px;
    cursor: pointer;
    transition: transform 0.1s ease, box-shadow 0.1s ease;
    z-index: 1;
}

:deep(.vuecal__event:hover) {
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    z-index: 5;
}

:deep(.vuecal__event-title) {
    font-weight: 600;
    font-size: 0.75rem;
    line-height: 1.3;
}

:deep(.vuecal__event-time) {
    font-size: 0.625rem;
    opacity: 0.85;
    margin-top: 2px;
}

/* Subject colors */
:deep(.subject-math) {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
    color: #1e40af !important;
    border-left: 3px solid #3b82f6 !important;
}

:deep(.subject-english) {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
    color: #92400e !important;
    border-left: 3px solid #f59e0b !important;
}

:deep(.subject-biology) {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%) !important;
    color: #065f46 !important;
    border-left: 3px solid #10b981 !important;
}

:deep(.subject-physics) {
    background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%) !important;
    color: #5b21b6 !important;
    border-left: 3px solid #8b5cf6 !important;
}

:deep(.subject-chemistry) {
    background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%) !important;
    color: #155e75 !important;
    border-left: 3px solid #06b6d4 !important;
}

:deep(.subject-history) {
    background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%) !important;
    color: #9d174d !important;
    border-left: 3px solid #ec4899 !important;
}

/* Hide unused elements */
:deep(.vuecal__no-event) {
    display: none;
}

:deep(.vuecal__cell-events-count) {
    display: none;
}

/* Responsive */
@media (max-width: 768px) {
    .calendar-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    :deep(.vuecal__time-column) {
        width: 45px;
    }
    
    :deep(.vuecal__event) {
        padding: 3px 5px;
        font-size: 0.6875rem;
    }
    
    :deep(.vuecal__event-time) {
        display: none;
    }
}
</style>

