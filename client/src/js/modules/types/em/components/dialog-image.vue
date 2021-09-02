<template>
  <dialog-with-preview
    ref="dialog"
    :title="title"
  >
    <template #dialogContent>
      <div :class="dialogContainerClass">
        <img
          :src="src"
          title="click to zoom"
          :class="dialogImageClass"
          @click="zoom"
        >
      </div>
    </template>

    <template #previewContent>
      <vue-xhr-image
        v-model="src"
        :title="title"
        :image-url="imageUrl"
        image-class="di-preview-image"
      />
    </template>
  </dialog-with-preview>
</template>

<script>
import VueXhrImage from 'app/components/vue-xhr-image.vue'
import DialogWithPreview from 'modules/types/em/components/dialog-with-preview.vue'

export default {
    'name': "DialogImage",
    'components': {
        'dialog-with-preview': DialogWithPreview,
        'vue-xhr-image': VueXhrImage,
    },
    'props': {
        'title': {
            'type': String,
            'required': true,
        },
        'imageUrl': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'src': '',
            'zoomed': false,
        }
    },
    'computed': {
        'dialogImageClass': function() {
            return this.zoomed ? '' : 'dialog-image'
        },
        'dialogContainerClass': function() {
            return ('dialog-image ' + (
                this.zoomed ? 'dialog-image-scroll' : ''
            )).trim()
        },
    },
    'methods': {
        'zoom': function() {
            this.zoomed = !this.zoomed
        }
    },
}
</script>

<style scoped>
.dialog-image {
    max-width: 90vw;
    max-height: 80vh;
}
.dialog-image-scroll {
    overflow: scroll;
}
</style>

<style>
.di-preview-image {
    height: 14vw;
    @media (max-width: 800px) {
        height: 11vw;
    }
    @media (max-width: 1280px) {
        height: 9vw;
    }
}
</style>
