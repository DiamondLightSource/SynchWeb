<template>
  <button
    class="flat-button"
    :class="levelToClasses"
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
    'data': function() {
        return {
            'colours': {
                'primary': ['blue', 500, 'white'],
                'secondary': ['gray', 400, 'black', 'white'],
                'success': ['green', 500, 'white'],
                // Cyan would be usual for info, but Tailwind has no such thing
                'info': ['pink', 500, 'black'],
                'warning': ['yellow', 300, 'black'],
                'danger': ['red', 500, 'white'],
            },
        }
    },
    'computed': {
        'levelToClasses': function() {
            const [background, shade, foreground, foregroundHover] =
                this.colours[this.level]
            var classes = [
                'tw-text-' + foreground,
                'tw-bg-' + background + '-' + shade,
                'hover:tw-bg-' + background + '-' + (shade + 200),
                'focus:tw-bg-' + background + '-' + (shade + 200),
            ]
            if (foregroundHover) {
                classes.push('hover:tw-text-' + foregroundHover)
                classes.push('focus:tw-text-' + foregroundHover)
            }
            return classes.join(' ')
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
