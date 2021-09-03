<template>
  <processing-section
    ref="previewImages"
    section-title="Classification"
    :data-available="particleClasses.length > 0"
  >
    <template #controls>
      <select-sort v-model="sortBy" />

      <select-page
        v-model="page"
        :max="pageCount"
      />
    </template>

    <div class="preview-images">
      <preview-image
        v-for="(particleClass, index) in particleClasses"
        :key="index"
        :particle-class="particleClass"
        :index="index"
        @click="click"
      />
    </div>
    <div class="main-image">
      <parameters :particle-class="particleClasses[selectedIndex]" />
      <img :src="mainSrc">
    </div>
  </processing-section>
</template>

<script>
import Parameters from 'modules/types/em/classification/parameters.vue'
import PreviewImage from 'modules/types/em/classification/preview-image.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'
import SelectPage from 'modules/types/em/classification/select-page.vue'
import SelectSort from 'modules/types/em/classification/select-sort.vue'

export default {
    'name': 'Classification',
    'components': {
        'parameters': Parameters,
        'preview-image': PreviewImage,
        'processing-section': ProcessingSection,
        'select-page': SelectPage,
        'select-sort': SelectSort,
    },
    'props': {
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'particleClasses': [],
            'mainSrc': '',
            'selectedIndex': 0,
            'sortBy': 'particles',
            'perPage': 0,
            'page': 1,
            'pageCount': 0,
        }
    },
    'watch': {
        'sortOrder': function(newValue, oldValue) {
            this.page = 1
            this.fetch()
        },
        'page': function(newValue, oldValue) {
            console.log('************', newValue, oldValue)
            this.fetch()
        },
    },
    'mounted': function() {
        this.perPage = Math.floor(
            (document.getElementById('content-wrapper').clientWidth - 75) / 150
        )
        this.fetch()
    },
    'methods': {
        'click': function(clicked) {
            this.mainSrc = clicked.src
            this.selectedIndex = clicked.index
        },
        'fetch': function() {
            this.$store.dispatch('em/fetch', {
                'url': '/em/particle/' + this.autoProcProgramId +
                    '?page=' + this.page +
                    '&per_page=' + this.perPage +
                    '&sort_by=' + this.sortBy,
                'humanName': 'Particle Classification',
            }).then(
                (response) => {
                    this.pageCount = Math.ceil(response.total / this.perPage)
                    this.particleClasses = response.classes
                }
            )
        },
    },
}
</script>

<style scoped>
.preview-images,
.main-image {
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.main-image {
    margin-top: 10px;
}
</style>
