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
        :height="proportionalHeight"
      >
    </a>
  </div>
</template>

<script>
import proportionalHeight from 'modules/types/em/components/proportional-height'
import XHRImage from 'utils/xhrimage'
import 'jquery.mp' // TODO: JQuery!!!

export default {
    'name': "DcImage",
    'mixins': [proportionalHeight],
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
        'image': function() {
            if (this.imageUrl) {
                this.xhrImage.load(this.imageUrl)
            }
            return this.imageUrl
        },
    },
    'mounted': function() {
        const imageTag = this.$refs.image
        const container = this.$refs.container
        this.xhrImage.onload = function() {
            imageTag.setAttribute('src', this.src)
            imageTag.classList.add('show')
            $(container).magnificPopup({ delegate: 'a', type: 'image' })
        }
    },
}
</script>
