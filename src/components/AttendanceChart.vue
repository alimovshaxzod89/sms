<template>
    <div class="w-full lg:w-2/3 mt-3 bg-white rounded-2xl p-4">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
            <IconMore class="cursor-pointer" />
        </div>

        <!-- Legend -->
        <div class="flex gap-4 mb-6">
            <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded-full bg-[#99CBFA]"></div>
                <span class="text-sm text-gray-500">Present</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded-full bg-[#C3EBFA]"></div>
                <span class="text-sm text-gray-500">Absent</span>
            </div>
        </div>

        <!-- Chart -->
        <div>
            <VueApexCharts type="bar" height="300" :options="chartOptions" :series="series" />
        </div>
    </div>
</template>
<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import IconMore from '@components/icon/IconMore.vue'

const props = defineProps({
    title: {
        type: String,
        default: 'Attendance'
    },
    attendanceData: {
        type: Array,
        default: () => [
            { day: 'Mon', present: 60, absent: 40 },
            { day: 'Tue', present: 70, absent: 60 },
            { day: 'Wed', present: 90, absent: 75 },
            { day: 'Thu', present: 90, absent: 75 },
            { day: 'Fri', present: 65, absent: 55 }
        ]
    }
})

const categories = computed(() => props.attendanceData.map(item => item.day))
const presentData = computed(() => props.attendanceData.map(item => item.present))
const absentData = computed(() => props.attendanceData.map(item => item.absent))

const series = computed(() => [
    {
        name: 'Present',
        data: presentData.value
    },
    {
        name: 'Absent',
        data: absentData.value
    }
])

const chartOptions = computed(() => ({
    chart: {
        type: 'bar',
        toolbar: {
            show: false
        }
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '50%',
            borderRadius: 8,
            borderRadiusApplication: 'end'
        }
    },
    dataLabels: {
        enabled: true
    },
    stroke: {
        show: false,
        width: 0,
        colors: ['transparent']
    },
    xaxis: {
        categories: categories.value,
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false
        },
        labels: {
            style: {
                colors: '#CBD5E1',
                fontSize: '12px'
            }
        }
    },
    yaxis: {
        min: 0,
        max: 100,
        tickAmount: 4,
        labels: {
            style: {
                colors: '#CBD5E1',
                fontSize: '12px'
            }
        }
    },
    grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 0,
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: true
            }
        }
    },
    colors: ['#99CBFA', '#CCE5FD'],
    legend: {
        show: false
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return val + ' students'
            }
        }
    }
}))
</script>



<style scoped></style>