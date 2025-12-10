<template>
  <svg :width="size" :height="size" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.83333 7.5L10 3.33333L14.1667 7.5H11.6667V12.5H8.33333V7.5H5.83333Z" fill="currentColor"/>
    <path d="M14.1667 12.5L10 16.6667L5.83333 12.5H8.33333V7.5H11.6667V12.5H14.1667Z" fill="currentColor"/>
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [String, Number],
    default: () => '1em'
  }
})
</script>

