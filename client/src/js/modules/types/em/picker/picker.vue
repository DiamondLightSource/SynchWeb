<template>
  <processing-section-movie-list
    section-title="Particle Picking"
    url-prefix="/em/picker/"
    :fetch-trigger="fetchTrigger"
    :auto-proc-program-id="autoProcProgramId"
    :loaded-movie-number="loadedMovieNumber"
    @loaded="loaded"
  >
    <params :pick="pick" />

    <dialog-image
      title="Summary Image"
      :image-url="imageUrl"
    />
  </processing-section-movie-list>
</template>

<script>
import DialogImage from 'modules/types/em/components/dialog-image.vue'
import ProcessingSectionMovieList from 'modules/types/em/components/processing-section-movie-list.vue'
import Params from 'modules/types/em/picker/params.vue'

export default {
    'name': "Picker",
    'components': {
        'dialog-image': DialogImage,
        'params': Params,
        'processing-section-movie-list': ProcessingSectionMovieList,
    },
    'props': {
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
        'fetchTrigger': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'pick': {},
        }
    },
    'computed': {
        'loadedMovieNumber': function() {
            return 'movieNumber' in this.pick ? this.pick.movieNumber : ''
        },
        'imageUrl': function() {
            const movie = this.loadedMovieNumber
            if (movie == '') {
                return '#'
            }
            return this.$store.state.apiUrl +
                '/em/picker/image/' + this.autoProcProgramId + '/n/' + movie
        },
    },
    'methods': {
        'loaded': function(pick) {
            this.pick = pick
        },
    },
}
</script>
