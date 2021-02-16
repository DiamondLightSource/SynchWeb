<template>
  <button
    @click.prevent="$emit('perform-button-action')"
    class="button-class"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'ButtonComponent',
}
</script>

<style scoped>
.button-class {
  @apply tw-rounded;
  @apply tw-px-4;
  @apply tw-py-2;
  @apply tw-border;
}
</style>