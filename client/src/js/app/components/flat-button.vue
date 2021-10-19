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
        @apply tw-bg-blue-500 tw-text-white;
        &:hover, &:focus {
            @apply tw-bg-blue-700;
        }
    }
    &.secondary {
        @apply tw-bg-gray-400 tw-text-black;
        &:hover, &:focus {
            @apply tw-bg-gray-600 tw-text-white;
        }
    }
    &.success {
        @apply tw-bg-green-500 tw-text-white;
        &:hover, &:focus {
            @apply tw-bg-green-700;
        }
    }
    &.info {
        /* Cyan would be usual for info, but Tailwind has no such thing */
        @apply tw-bg-pink-500 tw-text-black;
        &:hover, &:focus {
            @apply tw-bg-pink-700;
        }
    }
    &.warning {
        @apply tw-bg-yellow-300 tw-text-black;
        &:hover, &:focus {
            @apply tw-bg-yellow-500;
        }
    }
    &.danger {
        @apply tw-bg-red-500 tw-text-white;
        &:hover, &:focus {
            @apply tw-bg-red-700
        }
    }
}
</style>
