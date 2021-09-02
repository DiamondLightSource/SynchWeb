<template>
  <img
    :alt="title"
    :src="src"
    :class="computedImageClass"
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
        'imageClass': {
            'type': String,
            'default': '',
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
            'show': false,
        }
    },
    'computed': {
        'computedImageClass': function() {
            return (this.imageClass + (this.show ? ' show' : '')).trim()
        },
    },
    'watch': {
        'imageUrl': function() {
            this.loadImage()
        },
    },
    'mounted': function() {
        const vm = this
        this.xhrImage.onload = function() {
            vm.show = true
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
