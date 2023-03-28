<template>
  <div class="preview-image">
    {{ heading }}
    <vue-xhr-image
      v-model="src"
      :title="heading"
      :image-url="imageUrl"
      @click="click"
    />
  </div>
</template>

<script>
import VueXhrImage from 'app/components/vue-xhr-image.vue'

export default {
    'name': 'PreviewImage',
    'components': {
        'vue-xhr-image': VueXhrImage,
    },
    'props': {
        'particleClass': {
            'type': Object,
            'required': true,
        },
        'index': {
            'type': Number,
            'required': true,
        },
        'sortBy': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'src': '',
        }
    },
    'computed': {
        'heading': function() {
            const sortField = this.sortBy == 'particles' ?
                this.particleClass.particlesPerClass :
                this.particleClass.estimatedResolution
            return this.particleClass.batchNumber + ' - ' +
                this.particleClass.classNumber +
                ' (' + sortField + ')'
        },
        'imageUrl': function() {
            return this.$store.state.apiUrl + '/em/classification/image/' +
                this.particleClass.particleClassificationId
        },
    },
    'watch': {
        'src': function() {
            if (this.index == 0) {
                this.click()
            }
        },
    },
    'methods': {
        'click': function() {
            this.$emit('click', {
                'src': this.src,
                'index': this.index,
            })
        },
    },
}
</script>

<style scoped>
.preview-image {
    text-align: center;
    background-color: #fff;
    padding: 5px;
    border-radius: 6px;
}
.preview-image img {
    width: 150px;
}
</style>
