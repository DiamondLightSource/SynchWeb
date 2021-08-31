<template>
  <processing-section
    section-title="Classification"
    :data-available="true"
  >
    <div
      ref="previewImages"
      class="preview-images"
    >
      <preview-image
        v-for="(particleClass, index) in particleClasses"
        :key="index"
        :particle-class="particleClass"
        :index="index"
        @click="click"
      />
    </div>
    <div
      v-if="particleClasses.length > 0"
      class="main-image"
    >
      <parameters :particle-class="particleClasses[selectedIndex]" />
      <img :src="mainSrc">
    </div>
  </processing-section>
</template>

<script>
import Parameters from 'modules/types/em/classification/parameters.vue'
import PreviewImage from 'modules/types/em/classification/preview-image.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': "Classification",
    'components': {
        'parameters': Parameters,
        'preview-image': PreviewImage,
        'processing-section': ProcessingSection,
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
        }
    },
    'mounted': function() {
        const pageSize = Math.floor(this.$refs.previewImages.clientWidth / 150)
        this.$store.dispatch('em/fetch', {
            'url': '/em/particle/' + this.autoProcProgramId +
                '?page=1&per_page=' + pageSize,
            'humanName': 'Particle Picking',
        }).then(
            (particleClasses) => {
                this.particleClasses = particleClasses.data
            }
        )
    },
    'methods': {
        'click': function(clicked) {
            this.mainSrc = clicked.src
            this.selectedIndex = clicked.index
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
