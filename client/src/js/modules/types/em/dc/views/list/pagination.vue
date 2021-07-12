<template>
  <marionette-wrapper
    :options="marionetteOptions"
    :mview="pages"
  />
</template>

<script>
import Pages from 'views/pages'
import MarionetteWrapper from 'app/views/marionette/marionette-wrapper.vue'

export default {
    'name': 'Pagination',
    'components': {
        'marionette-wrapper': MarionetteWrapper,
    },
    'props': {
        'collection': {
            'type': Object,
            'required': true,
        },
    },
    'data': function () {
        return {
            'marionetteOptions': {
                'collection': this.collection,
                'noUrl': false,
            },
            'pages': Pages,
        }
    },
}
</script>
