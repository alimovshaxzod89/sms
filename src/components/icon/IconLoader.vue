<script setup>
defineProps({
  size: {
    type: String,
    default: 'default'
  }
})
</script>

<template>
  <div
      class="loader"
      :class="[
      { large: size === 'large' },
      { default: size === 'default' },
      { small: size === 'small' }
    ]"
  ></div>
</template>

<style scoped lang="scss">
.large {
  width: 64px;
  height: 64px;
  border-width: 4px !important;
}
.default {
  width: 36px;
  height: 36px;
  border-width: 2px !important;
}
.small {
  width: 16px;
  height: 16px;
  border-width: 1px !important;
}
.loader {
  aspect-ratio: 1;
  border-radius: 50%;
  border: 0.07em solid currentColor;
  animation:
      l20-1 1s infinite linear alternate,
      l20-2 2s infinite linear;
}
@keyframes l20-1 {
  0% {
    clip-path: polygon(50% 50%, 0 0, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%);
  }
  12.5% {
    clip-path: polygon(
            50% 50%,
            0 0,
            50% 0%,
            100% 0%,
            100% 0%,
            100% 0%,
            100% 0%
    );
  }
  25% {
    clip-path: polygon(
            50% 50%,
            0 0,
            50% 0%,
            100% 0%,
            100% 100%,
            100% 100%,
            100% 100%
    );
  }
  50% {
    clip-path: polygon(
            50% 50%,
            0 0,
            50% 0%,
            100% 0%,
            100% 100%,
            50% 100%,
            0% 100%
    );
  }
  62.5% {
    clip-path: polygon(
            50% 50%,
            100% 0,
            100% 0%,
            100% 0%,
            100% 100%,
            50% 100%,
            0% 100%
    );
  }
  75% {
    clip-path: polygon(
            50% 50%,
            100% 100%,
            100% 100%,
            100% 100%,
            100% 100%,
            50% 100%,
            0% 100%
    );
  }
  100% {
    clip-path: polygon(
            50% 50%,
            50% 100%,
            50% 100%,
            50% 100%,
            50% 100%,
            50% 100%,
            0% 100%
    );
  }
}
@keyframes l20-2 {
  0% {
    transform: scaleY(1) rotate(0deg);
  }
  49.99% {
    transform: scaleY(1) rotate(135deg);
  }
  50% {
    transform: scaleY(-1) rotate(0deg);
  }
  100% {
    transform: scaleY(-1) rotate(-135deg);
  }
}
</style>
