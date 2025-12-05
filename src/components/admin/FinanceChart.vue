<template>
    <a-card :bordered="false" class="shadow-sm">
        <!-- Header -->
        <template #title>
            <a-space>
                <IconBag class="w-5 h-5" />
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
        <a-space class="mb-6" :size="16" style="width: 100%; justify-content: center;">
            <a-tag color="#99CBFA">
                <template #icon>
                    <a-badge color="#99CBFA" />
                </template>
                Daromad
            </a-tag>
            <a-tag color="#C3EBFA">
                <template #icon>
                    <a-badge color="#C3EBFA" />
                </template>
                Xarajat
            </a-tag>
        </a-space>

        <!-- Chart -->
        <div>
            <VueApexCharts 
                type="line" 
                height="350" 
                :options="chartOptions" 
                :series="series" 
            />
        </div>
    </a-card>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import IconMore from '@/components/icon/IconMore.vue'
import IconBag from '@/components/icon/IconBag.vue'
import IconEye from '@/components/icon/IconEye.vue'
import IconExcel from '@/components/icon/IconExcel.vue'
import IconRefresh from '@/components/icon/IconRefresh.vue'

const props = defineProps({
    title: {
        type: String,
        default: 'Moliya'
    },
    financeData: {
        type: Array,
        default: () => [
            { month: 'Jan', income: 2500, expense: 1000 },
            { month: 'Feb', income: 3000, expense: 2100 },
            { month: 'Mar', income: 2000, expense: 2300 },
            { month: 'Apr', income: 2700, expense: 2100 },
            { month: 'May', income: 1800, expense: 1200 },
            { month: 'Jun', income: 2600, expense: 2600 },
            { month: 'Jul', income: 3500, expense: 2300 },
            { month: 'Aug', income: 2500, expense: 900 },
            { month: 'Sep', income: 3200, expense: 2000 },
            { month: 'Oct', income: 2300, expense: 1300 },
            { month: 'Nov', income: 3400, expense: 1100 },
            { month: 'Dec', income: 3200, expense: 1000 }
        ]
    }
})

const categories = computed(() => props.financeData.map(item => item.month))
const incomeData = computed(() => props.financeData.map(item => item.income))
const expenseData = computed(() => props.financeData.map(item => item.expense))

const series = computed(() => [
    {
        name: 'Xarajat',
        data: incomeData.value
    },
    {
        name: 'Daromad',
        data: expenseData.value
    }
])

const chartOptions = computed(() => ({
    chart: {
        type: 'line',
        toolbar: {
            show: false
        },
        zoom: {
            enabled: false
        }
    },
    stroke: {
        width: [3, 3],
        curve: 'smooth'
    },
    dataLabels: {
        enabled: false
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
                colors: '#D1D5DB',
                fontSize: '12px'
            }
        }
    },
    yaxis: {
        min: 0,
        max: 3600,
        tickAmount: 4,
        labels: {
            style: {
                colors: '#D1D5DB',
                fontSize: '12px'
            }
        }
    },
    grid: {
        borderColor: '#F3F4F6',
        strokeDashArray: 5,
        xaxis: {
            lines: {
                show: true
            }
        },
        yaxis: {
            lines: {
                show: true
            }
        },
        padding: {
            top: 0,
            right: 10,
            bottom: 0,
            left: 10
        }
    },
    colors: ['#C3EBFA', '#99CBFA'],
    legend: {
        show: false
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return '$' + val.toLocaleString()
            }
        }
    },
    markers: {
        size: 5,
        colors: ['#C3EBFA', '#99CBFA'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
            size: 7
        }
    }
}))
</script>

<style scoped></style>

