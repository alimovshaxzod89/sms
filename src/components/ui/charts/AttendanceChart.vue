<template>
    <a-card :bordered="false" class="shadow-sm h-full">
        <!-- Header -->
        <template #title>
            <a-space>
                <IconAttendance class="w-5 h-5" />
                <span>{{ title }}</span>
            </a-space>
        </template>
        <template #extra>
            <a-dropdown>
                <a-button type="text" size="small" shape="circle">
                    <IconMore class="cursor-pointer" />
                </a-button>
                <template #overlay>
                    <a-menu>
                        <a-menu-item key="1">
                            <IconEye class="w-4 h-4 inline mr-2" />
                            Batafsil
                        </a-menu-item>
                        <a-menu-item key="2">
                            <IconExcel class="w-4 h-4 inline mr-2" />
                            Export
                        </a-menu-item>
                        <a-menu-item key="3">
                            <IconRefresh class="w-4 h-4 inline mr-2" />
                            Yangilash
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </template>

        <!-- Legend -->
        <a-space class="mb-6" :size="16">
            <a-tag color="#99CBFA">
                <template #icon>
                    <a-badge color="#99CBFA" />
                </template>
                Kelgan
            </a-tag>
            <a-tag color="#C3EBFA">
                <template #icon>
                    <a-badge color="#C3EBFA" />
                </template>
                Kelmagan
            </a-tag>
        </a-space>

        <!-- Chart -->
        <div>
            <VueApexCharts type="bar" height="300" :options="chartOptions" :series="series" />
        </div>
    </a-card>
</template>
<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import IconMore from '@components/icon/IconMore.vue'
import IconAttendance from '@/components/icon/menu-icons/IconAttendance.vue'
import IconEye from '@/components/icon/IconEye.vue'
import IconExcel from '@/components/icon/IconExcel.vue'
import IconRefresh from '@/components/icon/IconRefresh.vue'

const props = defineProps({
    title: {
        type: String,
        default: 'Davomat'
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
        name: 'Kelgan',
        data: presentData.value
    },
    {
        name: 'Kelmagan',
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

