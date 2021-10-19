<template>
  <button
    class="flat-button"
    :class="level"
    :title="hint"
    @click.prevent="$emit('click')"
    @mouseover.prevent="$emit('mouseover')"
  >
    <slot />
  </button>
</template>

<script>
export default {
    'name': "FlatButton",
    'props': {
        'level': {
            'type': String,
            'default': 'secondary',
        },
        'hint': {
            'type': String,
            'default': '',
        },
    },
}
</script>

<style lang="scss" scoped>
/* I'm using "tailwind compatible" colours here
   ...and if you can reproduce it using actual Tailwind please feel free */
.flat-button {
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    box-sizing: content-box;
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
    &:disabled, &.disabled {
        opacity: 0.5;
        cursor: auto;
    }
    &.primary {
        background-color: #4299e1; /* tw-bg-blue-500 */
        color: #fff; /* tw-text-white */
        &:hover, &:focus {
            background-color: #2b6cb0; /* tw-bg-blue-700 */
        }
    }
    &.secondary {
        background-color: #cbd5e0; /* tw-bg-gray-400 */
        color: #000; /* tw-text-black */
        &:hover, &:focus {
            background-color: #718096; /* tw-bg-gray-600 */
            color: #fff; /* tw-text-white */
        }
    }
    &.success {
        background-color: #48bb78; /* tw-bg-green-500 */
        color: #fff; /* tw-text-white */
        &:hover, &:focus {
            background-color: #2f855a; /* tw-bg-green-700 */
        }
    }
    &.info {
        /* Cyan would be usual for info, but Tailwind has no such thing */
        background-color: #ed64a6; /* tw-bg-pink-500 */
        color: #000; /* tw-text-black */
        &:hover, &:focus {
            background-color: #b83280; /* tw-bg-pink-700 */
        }
    }
    &.warning {
        background-color: #faf089; /* tw-bg-yellow-300 */
        color: #000; /* tw-text-black */
        &:hover, &:focus {
            background-color: #ecc94b; /* tw-bg-yellow-500 */
        }
    }
    &.danger {
        background-color: #f56565; /* tw-bg-red-500 */
        color: #fff; /* tw-text-white */
        &:hover, &:focus {
            background-color: #c53030; /* tw-bg-red-700 */
        }
    }
}
</style>
