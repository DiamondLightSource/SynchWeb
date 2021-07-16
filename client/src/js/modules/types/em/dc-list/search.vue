<template>
  <marionette-wrapper
    :options="marionetteOptions"
    :mview="searchView"
    preloaded="true"
  />
</template>

<script>
import SearchView from 'views/search'
import MarionetteWrapper from 'app/views/marionette/marionette-wrapper.vue'

export default {
    'name': 'Search',
    'components': {
        'marionette-wrapper': MarionetteWrapper,
    },
    'props': {
        'value': {
            'type': String,
            'required': true,
        },
        'collection': {
            'type': Object,
            'required': true,
        },
        'url': {
            'type': String,
            'required': true,
        },
    },
    'data': function () {
        return {
            'marionetteOptions': {
                'value': this.value,
                'collection': this.collection,
                'url': this.url,
            },
            'searchView': SearchView,
        }
    },
}
</script>
