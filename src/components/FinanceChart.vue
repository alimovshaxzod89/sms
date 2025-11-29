<template>
    <div class="w-full bg-white rounded-2xl p-4 mt-3">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
            <IconMore class="cursor-pointer" />
        </div>

        <!-- Legend -->
        <div class="flex justify-center gap-6 mb-6">
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-[#99CBFA]"></div>
                <span class="text-sm text-gray-400">income</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-[#C3EBFA]"></div>
                <span class="text-sm text-gray-400">expense</span>
            </div>
        </div>

        <!-- Chart -->
        <div>
            <VueApexCharts 
                type="line" 
                height="350" 
                :options="chartOptions" 
                :series="series" 
            />
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
        default: 'Finance'
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
        name: 'Income',
        data: incomeData.value
    },
    {
        name: 'Expense',
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

