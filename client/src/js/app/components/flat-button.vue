<template>
  <button
    class="flat-button"
    :class="levelToClasses"
    @click="$emit('click')"
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
    },
    'data': function() {
        return {
            'colours': {
                'primary': ['white', 'blue', 500],
                'secondary': ['white', 'gray', 500],
                'success': ['white', 'green', 500],
                // Cyan would be usual for info, but Tailwind has no such thing
                'info': ['black', 'pink', 500],
                'warning': ['black', 'yellow', 300],
                'danger': ['white', 'red', 500],
            },
        }
    },
    'computed': {
        'levelToClasses': function() {
            const [foreground, background, shade] =
                this.colours[this.level]
            const darkened = 'tw-bg-' + background + '-' + (shade + 200)
            return 'tw-text-' + foreground +
                ' tw-bg-' + background + '-' + shade +
                ' hover:' + darkened + ' focus:' + darkened
        }
    }
}
</script>

<style scoped>
.flat-button {
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    box-sizing: content-box;
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
}
.flat-button:disabled, .flat-button.disabled {
    opacity: 0.5;
    cursor: auto;
}
</style>
