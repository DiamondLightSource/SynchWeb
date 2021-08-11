<template>
  <a
    href="#"
    class="button button-notext"
    :class="highlightClass"
    :title="hint"
    @click.prevent="$emit('click')"
  >
    <i :class="iconClass" />
    <b v-if="buttonLabel != ''">{{ buttonLabel }}</b>
    <span>{{ buttonText }}</span>
  </a>
</template>

<script>
export default {
    'name': 'ButtonWithFunction',
    'props': {
        'iconClass': {
            'type': String,
            'required': true,
        },
        'buttonLabel': {
            'type': String,
            'default': '',
        },
        'buttonText': {
            'type': String,
            'required': true,
        },
        'hint': {
            'type': String,
            'required': true,
        },
        'highlight': {
            'type': Boolean,
            'default': false,
        },
    },
    'computed': {
        'highlightClass': function() {
            return this.highlight ? 'button-highlight' : ''
        },
    },
}
</script>
