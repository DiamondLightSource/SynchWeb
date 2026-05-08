<template>
  <button
    class="flat-button"
    :class="level"
    :title="hint"
    @click.stop.capture="$emit('click')"
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
