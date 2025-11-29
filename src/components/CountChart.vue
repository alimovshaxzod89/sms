<template>
    <div class="w-full lg:w-1/3 mt-3 bg-white rounded-2xl p-4">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
            <IconMore class="cursor-pointer" />
        </div>

        <!-- Chart -->
        <div class="relative">
            <VueApexCharts 
                type="radialBar" 
                height="280" 
                :options="chartOptions" 
                :series="series" 
            />

            <!-- Center Icons -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2">
                <IconBoy class="text-[#3498F5] w-8 h-8" />
                <IconGirl class="text-[#fc038c] w-8 h-8" />
            </div>
        </div>

        <!-- Legend -->
        <div class="flex justify-center gap-8 mt-4">
            <div class="text-center">
                <div class="flex items-center justify-center gap-2 mb-1">
                    <div class="w-4 h-4 rounded-full bg-[#FAE27C]"></div>
                </div>
                <div class="text-2xl font-bold">{{ totalCount.toLocaleString() }}</div>
                <div class="text-xs text-gray-400">Total: (100%)</div>
            </div>
            <div class="text-center">
                <div class="flex items-center justify-center gap-2 mb-1">
                    <div class="w-4 h-4 rounded-full bg-[#3498F5]"></div>
                </div>
                <div class="text-2xl font-bold">{{ boysCount.toLocaleString() }}</div>
                <div class="text-xs text-gray-400">Boys ({{ boysPercentage }}%)</div>
            </div>
            <div class="text-center">
                <div class="flex items-center justify-center gap-2 mb-1">
                    <div class="w-4 h-4 rounded-full bg-[#fc038c]"></div>
                </div>
                <div class="text-2xl font-bold">{{ girlsCount.toLocaleString() }}</div>
                <div class="text-xs text-gray-400">Girls ({{ girlsPercentage }}%)</div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import IconMore from '@components/icon/IconMore.vue'
import IconBoy from './icon/IconBoy.vue'
import IconGirl from './icon/IconGirl.vue'

const props = defineProps({
    title: {
        type: String,
        default: 'Students'
    },
    boysCount: {
        type: Number,
        default: 65
    },
    girlsCount: {
        type: Number,
        default: 35
    }
})

const totalCount = computed(() => props.boysCount + props.girlsCount)

const boysPercentage = computed(() => {
    return totalCount.value > 0 ? Math.round((props.boysCount / totalCount.value) * 100) : 0
})

const girlsPercentage = computed(() => {
    return totalCount.value > 0 ? Math.round((props.girlsCount / totalCount.value) * 100) : 0
})

const series = computed(() => [boysPercentage.value, girlsPercentage.value])

const chartOptions = computed(() => ({
    chart: {
        type: 'radialBar',
        sparkline: {
            enabled: true
        }
    },
    plotOptions: {
        radialBar: {
            hollow: {
                margin: 0,
                size: '40%'
            },
            track: {
                margin: 5,
                background: '#f1f5f9'
            },
            dataLabels: {
                show: false
            }
        }
    },
    colors: ['#3498F5', '#fc038c'],
    stroke: {
        lineCap: 'round'
    },
    labels: ['Boys', 'Girls']
}))
</script>

<style scoped></style>