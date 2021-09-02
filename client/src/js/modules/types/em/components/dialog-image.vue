<template>
  <dialog-with-preview
    ref="dialog"
    :title="title"
  >
    <template #dialogContent>
      <img
        :src="src"
        class="dialog-image"
      >
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
        }
    },
}
</script>

<style scoped>
.dialog-image {
    max-width: 90vw;
    max-height: 80vh;
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
