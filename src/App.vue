<template>
  <RouterView />
</template>

<style lang="scss" scoped>
.main-loader {
  height: 100%;

  &:deep(.ant-spin-container) {
    height: 100%;
  }
}
</style>