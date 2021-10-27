<template>
  <processing-section
    :section-title="sectionTitle"
    :data-available="max > 0"
    :default-hidden="false"
  >
    <template #controls>
      <movie-select
        :max="max"
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
    'name': "ProcessingSectionMovieSelect",
    'components': {
        'movie-select': MovieSelect,
        'processing-section': ProcessingSection,
    },
    'props': {
        'sectionTitle': {
            'type': String,
            'required': true,
        },
        'urlPrefix': {
            'type': String,
            'required': true,
        },
        'max': {
            'type': String,
            'required': true,
        },
        'autoProcProgramId': {
            'type': String,
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
        }
    },
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'movieNumber': function(newValue, oldValue) {
            this.fetchDetail()
        },
    },
    'methods': {
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
            this.$store.dispatch('em/api/fetch', {
                'url': this.urlPrefix +
                    '/' + this.autoProcProgramId +
                    '/n/' + this.movieNumber,
                'humanName': this.sectionTitle + ' Details',
            }).then(
                (details) => { this.$emit('loaded', details) }
            )
        },
    },
}
</script>
