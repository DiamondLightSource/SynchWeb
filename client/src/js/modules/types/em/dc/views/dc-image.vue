<template>
  <div
    ref="container"
    :class="containerClass"
    :title="containerTitle"
    :data-image="image"
  >
    <a
      :href="imageUrl"
      :title="imageTitle"
    >
      <img
        ref="image"
        :alt="imageTitle"
        :height="imageHeight"
      >
    </a>
  </div>
</template>

<script>
import proportionalHeight from 'modules/types/em/dc/views/proportional-height'
import XHRImage from 'utils/xhrimage'

export default {
    'name': "DcImage",
    'props': {
        'containerClass': {
            'type': String,
            'required': true
        },
        'containerTitle': {
            'type': String,
            'required': true,
        },
        'imageUrl': {
            'type': String,
            'required': true,
        },
        'imageTitle': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'xhrImage': new XHRImage(),
        }
    },
    'computed': {
        'imageHeight': proportionalHeight,
        'image': function() {
            this.xhrImage.load(this.imageUrl)
            return this.imageUrl
        },
    },
    'mounted': function() {
        const imageTag = this.$refs.image
        const container = this.$refs.container
        this.xhrImage.onload = function() {
            imageTag.setAttribute('src', this.src)
            // imageTag.addClass('show')
            container.magnificPopup({ delegate: 'a', type: 'image' })
        }
    },
}
</script>
