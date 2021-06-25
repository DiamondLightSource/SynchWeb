<template>
  <div
    :class="classes"
    :title="containerTitle"
    :style="style"
  >
    <a
      :href="imageUrl"
      :title="imageTitle"
    >
      <img :alt="imageTitle">
    </a>
  </div>
</template>

<script>
import 'jquery.mp'

export default {
    'name': "DcImage",
    'props': {
        'classes': {
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
    'computed': {
        'style': function() {
            // TODO: Find a tidier way to apply the scaling factor
            const windowWidth = $(window).width()
            const proportionalHeight = 0.175 * windowWidth * 0.95
            const heightScalingFactor = windowWidth < 800 ? 1.65 : (
                windowWidth < 1280 ? 1.3 : 1
            )
            const height = Math.round(
                proportionalHeight * heightScalingFactor * 0.8
            ) + 'px;'
            return 'min-height: ' + height + ' max-height: ' + height
        },
    },
}
</script>
