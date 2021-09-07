<template>
  <processing-section
    :section-title="sectionTitle"
    :data-available="movieList.length > 0"
    :default-hidden="defaultHidden"
  >
    <template #controls>
      <movie-select
        :movie-list="movieList"
        @changed="selectChanged"
      />
    </template>

    <slot />
  </processing-section>
</template>

<script>
import MovieSelect from 'modules/types/em/components/movie-select.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': "ProcessingSectionMovieList",
    'components': {
        'movie-select': MovieSelect,
        'processing-section': ProcessingSection,
    },
    'props': {
        'sectionTitle': {
            'type': String,
            'required': true,
        },
        'defaultHidden': {
            'type': Boolean,
            'default': false,
        },
        'urlPrefix': {
            'type': String,
            'required': true,
        },
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
        'loadedMovieNumber': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'movieNumber': 1,
            'movieList': [],
        }
    },
    'computed': {
        'baseUrl': function() {
            return this.urlPrefix + this.autoProcProgramId
        },
    },
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'movieNumber': function(newValue, oldValue) {
            this.fetchDetail()
        },
    },
    'mounted': function() {
        this.fetchList()
    },
    'methods': {
        'fetchList': function() {
            this.$store.dispatch('em/fetch', {
                'url': this.baseUrl,
                'humanName': this.sectionTitle + ' List',
            }).then(
                (movieList) => { this.movieList = movieList }
            )
        },
        'selectChanged': function(movieNumber) {
            this.movieNumber = movieNumber
        },
        'fetchDetail': function() {
            if (
                (!this.autoProcProgramId) ||
                (!this.movieNumber) ||
                (this.movieNumber == this.loadedMovieNumber)
            ) {
                return
            }
            this.$store.dispatch('em/fetch', {
                'url': this.baseUrl + '/n/' + this.movieNumber,
                'humanName': this.sectionTitle + ' Details',
            }).then(
                (details) => { this.$emit('loaded', details) }
            )
        },
    },
}
</script>
