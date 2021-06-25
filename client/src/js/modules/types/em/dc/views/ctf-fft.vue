<template>
  <dc-image
    container-title="Click to view FFT"
    image-title="FFT Theoretical"
    classes="diffraction fft"
    :image-url="imageUrl"
  />
</template>

<script>
import dcImage from 'modules/types/em/dc/views/components/dc-image.vue'

export default {
    'name': "CtfFftView",
    'components': {
        'dc-image': dcImage
    },
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
        'imageUrl': function() {
            return this.apiUrl +
                '/em/ctf/image/' + this.model.get('DATACOLLECTIONID') +
                '/n/' + this.model.get('IMAGENUMBER')
        },
        /* TODO: There is no data that includes a FftTheoreticalFullPath
                 since 2019.
                 I'm assuming that this image is not in use.
                 If you do need to "port" the loading code, see:
                 https://github.com/DiamondLightSource/SynchWeb/blob/master/client/src/js/modules/types/em/dc/views/ctf.js
        */
    },
}
</script>
