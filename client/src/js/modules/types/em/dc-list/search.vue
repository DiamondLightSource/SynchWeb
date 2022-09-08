<template>
  <marionette-wrapper
    :mview="searchView"
    :options="marionetteOptions"
    preloaded
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
    },
    'data': function () {
        return {
            'marionetteOptions': {
                'value': this.value,
                'collection': this.collection,
            },
            'searchView': SearchView,
        }
    },
}
</script>
