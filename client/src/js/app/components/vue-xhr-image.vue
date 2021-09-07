<template>
  <img
    v-if="src"
    :alt="title"
    :src="src"
    @click="$emit('click')"
  >
</template>

<script>
import XHRImage from 'utils/xhrimage'

export default {
    'name': "VueXhrImage",
    'model': {
        'prop': 'src',
        'event': 'change',
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
        // `src` is always blank initially
        // it will get a value when this component executes `xhrImage.load`
        // to specify an image to load use `imageUrl`
        // See `utils/xhrimage` for more details
        'src': {
            'type': String,
            'required': true,
        }
    },
    'data': function() {
        return {
            'xhrImage': new XHRImage(),
        }
    },
    'watch': {
        'imageUrl': function() {
            this.loadImage()
        },
    },
    'mounted': function() {
        const vm = this
        this.xhrImage.onload = function() {
            vm.$emit('change', this.src)
        }
        this.loadImage();
    },
    'methods': {
        'loadImage': function() {
            if (this.imageUrl) {
                this.xhrImage.load(this.imageUrl)
            }
        },
    },
}
</script>
