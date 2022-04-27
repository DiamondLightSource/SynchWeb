<template>
  <div class="tw-flex tw-items-center">
    <span class="tw-w-2 tw-h-full tw-mx-1 tw-bg-content-dark-background"></span>
    <span class="tw-bg-content-mid-background tw-flex-1 tw-py-3 tw-px-1 tw-h-full">
      <slot>{{ value }}</slot>
    </span>
  </div>
</template>
<script>
export default {
  name: 'data-collection-field',
  props: {
    value: {
      type: [String, Number, Object, Array]
    }
  }
}
</script>
<style></style>