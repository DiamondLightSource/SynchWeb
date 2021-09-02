<template>
  <dialog-with-preview
    ref="dialog"
    :title="title"
  >
    <template #dialogContent>
      <img
        :src="src"
        :style="dialogImageStyle"
      >
    </template>

    <template #previewContent>
      <vue-xhr-image
        v-model="src"
        :title="title"
        :computed-style="proportionalHeight"
        :image-url="imageUrl"
      />
    </template>
  </dialog-with-preview>
</template>

<script>
import proportionalHeight from 'modules/types/em/components/proportional-height'
import VueXhrImage from 'app/components/vue-xhr-image.vue'
import DialogWithPreview from 'modules/types/em/components/dialog-with-preview.vue'

export default {
    'name': "DialogImage",
    'components': {
        'dialog-with-preview': DialogWithPreview,
        'vue-xhr-image': VueXhrImage,
    },
    'mixins': [proportionalHeight],
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
    'computed': {
        'dialogImageStyle': function() {
            return this.$refs.dialog.maxSizeStyle('msx-width', 'max-height')
        },
    },
}
</script>
