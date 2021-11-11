<template>
  <processing-section-image-select
    section-title="Motion Correction"
    url-prefix="mc"
    :latest="latest"
    :max="max"
    :auto-proc-program-id="autoProcProgramId"
    :loaded-image-number="loadedImageNumber"
    @loaded="loaded"
  >
    <params :motion-correction="motionCorrection" />

    <dialog-image
      title="Micrograph Snapshot"
      :image-url="snapshotUrl"
    />

    <drift
      :auto-proc-program-id="autoProcProgramId"
      :image-number="loadedImageNumber"
    />
  </processing-section-image-select>
</template>

<script>
import DialogImage from 'modules/types/em/components/dialog-image.vue'
import Drift from 'modules/types/em/mc/drift.vue'
import Params from 'modules/types/em/mc/params.vue'
import ProcessingSectionImageSelect from 'modules/types/em/components/processing-section-image-select.vue'

export default {
    'name': "MotionCorrection",
    'components': {
        'dialog-image': DialogImage,
        'drift': Drift,
        'params': Params,
        'processing-section-image-select': ProcessingSectionImageSelect,
    },
    'props': {
        'autoProcProgramId': {
            'type': String,
            'required': true,
        },
        'max': {
            'type': String,
            'required': true,
        },
        'latest': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'motionCorrection': {},
        }
    },
    'computed': {
        'loadedImageNumber': function() {
            return 'imageNumber' in this.motionCorrection ?
                this.motionCorrection.imageNumber : ''
        },
        'snapshotUrl': function() {
            const image = this.loadedImageNumber
            if (image == '') {
                return '#'
            }
            return this.$store.state.apiUrl +
                '/em/mc/snapshot/' + this.autoProcProgramId + '/n/' + image
        },
    },
    'methods': {
        'loaded': function(motionCorrection) {
            this.motionCorrection = motionCorrection
        },
    },
}
</script>
