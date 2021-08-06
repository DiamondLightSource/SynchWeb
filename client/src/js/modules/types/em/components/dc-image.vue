<template>
  <div
    ref="container"
    :class="containerClass"
    :title="containerTitle"
    :data-image="image"
  >
    <dialog-image
      :is-active="showDialog"
      :title="title"
      :src="src"
      @cancel="showDialog = false"
    />
    <img
      :alt="title"
      :style="proportionalHeight"
      :src="src"
      :class="imageClass"
      @click="showDialog = true"
    >
  </div>
</template>

<script>
import DialogImage from 'app/components/dialog-image.vue'
import proportionalHeight from 'modules/types/em/components/proportional-height'
import XHRImage from 'utils/xhrimage'

export default {
    'name': "DcImage",
    'components': {
        'dialog-image': DialogImage,
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
            'xhrImage': new XHRImage(),
            'src': '',
            'imageClass': '',
            'showDialog': false,
        }
    },
    'computed': {
        'image': function() {
            if (this.imageUrl) {
                this.xhrImage.load(this.imageUrl)
            }
            return this.imageUrl
        },
        'containerTitle': function() {
            return 'Click to view ' + this.title
        },
    },
    'mounted': function() {
        const vm = this
        this.xhrImage.onload = function() {
            vm.src = this.src
            vm.imageClass = 'show'
        }
    },
}
</script>
