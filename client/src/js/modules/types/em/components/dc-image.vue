<template>
  <div
    ref="container"
    :class="containerClass"
    :title="containerTitle"
  >
    <dialog-image
      :is-active="showDialog"
      :title="title"
      :src="src"
      @cancel="showDialog = false"
    />
    <vue-xhr-image
      v-model="src"
      :title="title"
      :computed-style="proportionalHeight"
      :image-url="imageUrl"
      @click="showDialog = true"
    />
  </div>
</template>

<script>
import DialogImage from 'app/components/dialog-image.vue'
import proportionalHeight from 'modules/types/em/components/proportional-height'
import VueXhrImage from 'app/components/vue-xhr-image.vue'

export default {
    'name': "DcImage",
    'components': {
        'dialog-image': DialogImage,
        'vue-xhr-image': VueXhrImage,
    },
    'mixins': [proportionalHeight],
    'props': {
        'containerClass': {
            'type': String,
            'required': true
        },
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
            'showDialog': false,
        }
    },
    'computed': {
        'containerTitle': function() {
            return 'Click to view ' + this.title
        },
    },
}
</script>
