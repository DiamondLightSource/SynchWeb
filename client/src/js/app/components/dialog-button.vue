<template>
  <flat-button
    class="dialog-button"
    :level="level"
    @click="$emit('click')"
  >
    <slot />
  </flat-button>
</template>

<script>
import FlatButton from 'app/components/flat-button.vue'

export default {
    'name': 'DialogButton',
    'components': {
        'flat-button': FlatButton,
    },
    'props': {
        'level': {
            'type': String,
            'default': '',
        },
    },
}
</script>

<style scoped>
.dialog-button {
    flex-basis: 100%;
    margin: 8px;
}
</style>
