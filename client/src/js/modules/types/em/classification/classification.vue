<template>
  <processing-section
    ref="previewImages"
    :section-title="sectionTitle"
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
        :sort-by="sortBy"
        :index="index"
        @click="click"
      />
    </div>
    <div class="selected-class">
      <parameters :particle-class="selectedClass" />
      <div class="selected-image">
        {{ heading }}
        <img :src="selectedSrc">
      </div>
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
            'type': String,
            'required': true,
        },
        'fetchTrigger': {
            'type': String,
            'required': true,
        },
        'type': {
            'type': String,
            'required': true,
            'validator': function(value) {
                return ['2D', '3D'].includes(value);
            },
        },
    },
    'data': function() {
        return {
            'particleClasses': [],
            'selectedIndex': 0,
            'selectedSrc': '',
            'sortBy': 'particles',
            'perPage': 0,
            'page': 1,
            'pageCount': 0,
        }
    },
    'computed': {
        'selectedClass': function() {
            const selected = this.particleClasses[this.selectedIndex]
            return typeof selected == 'undefined' ? {} : selected
        },
        'heading': function() {
            const batchNumber = 'batchNumber' in this.selectedClass ?
                this.selectedClass.batchNumber : ''
            const classNumber = 'classNumber' in this.selectedClass ?
                this.selectedClass.classNumber : ''
            return batchNumber && classNumber ? (
                batchNumber + ' - ' + classNumber
            ) : 'none selected'
        },
        'sectionTitle': function() {
            return this.type + ' Classification'
        },
    },
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'sortBy': function(newValue, oldValue) {
            this.page = 1
            this.fetch()
        },
        // eslint-disable-next-line no-unused-vars
        'page': function(newValue, oldValue) {
            this.fetch()
        },
        // eslint-disable-next-line no-unused-vars
        'fetchTrigger': function(newValue, oldValue) {
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
            this.selectedIndex = clicked.index
            this.selectedSrc = clicked.src
        },
        'fetch': function() {
            if (this.autoProcProgramId) {
                this.$store.dispatch('em/api/fetch', {
                    'url': 'classification/' + this.autoProcProgramId +
                        '/type/' + this.type +
                        '?page=' + this.page +
                        '&per_page=' + this.perPage +
                        '&sort_by=' + this.sortBy,
                    'humanName': this.type + ' Particle Classification',
                }).then(
                    (response) => {
                        this.pageCount = Math.ceil(response.total / this.perPage)
                        this.particleClasses = response.classes
                    }
                )
            }
        },
    },
}
</script>

<style scoped>
.preview-images,
.selected-class {
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.selected-class {
    margin-top: 10px;
}
.selected-image {
    background-color: #fff;
    padding: 5px;
    border-radius: 6px;
    text-align: center;
}
</style>
