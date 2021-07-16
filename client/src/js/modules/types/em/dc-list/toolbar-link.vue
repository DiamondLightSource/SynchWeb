<template>
  <a
    :class="anchorClass"
    :href="href"
    :title="anchorTitle"
    @mouseover.prevent="$emit('mouseover')"
    @mouseleave="$emit('mouseleave')"
  >
    <i :class="iconClass" />
    <span>{{ title }}</span>
    <slot />
  </a>
</template>

<script>
import MarionetteApplication from 'app/marionette-application.js'

export default {
    'name': 'ToolbarLink',
    'props': {
        'title': {
            'type': String,
            'required': true,
        },
        'icon': {
            'type': String,
            'required': true,
        },
        'href': {
            'type': String,
            'default': '#',
        },
        'extraClass': {
            'type': String,
            'default': '',
        },
    },
    'computed' : {
        'isMobile': function() {
            return MarionetteApplication.getInstance().mobile()
        },
        'anchorTitle': function() {
            return this.href == '#' ? '' : this.title
        },
        'anchorClass': function() {
            var classes = 'button ' + this.extraClass
            if (this.isMobile) {
                classes = classes + ' button-notext'
            }
            return classes
        },
        'iconClass': function() {
            var classes = 'fa ' + this.icon
            if (this.isMobile) {
                classes = classes + ' fa-2x'
            }
            return classes
        },
    },
}
</script>
