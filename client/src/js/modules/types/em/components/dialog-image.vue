<template>
  <div>
    <dialog-modal
      v-if="showDialog"
      :show-dialog="showDialog"
      :title="title"
      @cancel="showDialog = false"
    >
      <div :class="dialogContainerClass">
        <img
          :src="src"
          title="click to zoom"
          :class="dialogImageClass"
          @click="zoom"
        >
      </div>
    </dialog-modal>

    <div
      class="preview-container"
      :title="previewHint"
      @click="showDialog = true"
    >
      <!-- v-html is only needed to support current version of ice-breaker.
           When ice-breaker is moved to ISpyB and is plotted locally,
           we can do without v-html -->
      <div
        class="preview-heading"
        v-html="title"
      />
      <vue-xhr-image
        v-model="src"
        :title="title"
        :image-url="imageUrl"
        class="di-preview-image"
      />
    </div>
  </div>
</template>

<script>
import DialogModal from 'app/components/dialog-modal.vue'
import VueXhrImage from 'app/components/vue-xhr-image.vue'

export default {
    'name': "DialogImage",
    'components': {
        'dialog-modal': DialogModal,
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
            'showDialog': false,
        }
    },
    'computed': {
        'previewHint': function() {
            return 'Click to view ' + this.title
        },
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
.preview-heading {
    text-align: center;
    font-weight: bold;
    margin-bottom: 5px;
}
.preview-container {
    background-color: #fff;
    padding: 5px;
    border-radius: 6px;
}
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
