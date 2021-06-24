<template>
  <div
    class="diffraction fft"
    title="Click to view FFT"
    :style="divStyle"
  >
    <a
      :href="hrefUrl"
      title="FFT Theoretical"
    >
      <img
        src=""
        alt="FFT Theoretical"
      >
    </a>
  </div>
</template>

<script>
import 'jquery.mp'

export default {
    'name': "CtfFftView",
    'props': {
        'apiUrl': {
            'type': String,
            'required': true,
        },
        'model': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'hrefUrl': function() {
            return this.apiUrl +
                '/em/ctf/image/' +
                this.model.get('DATACOLLECTIONID') +
                '/n/' +
                this.model.get('IMAGENUMBER')
        },
        /* TODO: There is no data that includes a FftTheoreticalFullPath
                 since 2019.
                 I'm assuming that this image is not in use.
                 If you do need to "port" the loading code, go back to
                 before this commit and look at modules/types/em/dc/views/ctf.js
        */
        'divStyle': function() {
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
