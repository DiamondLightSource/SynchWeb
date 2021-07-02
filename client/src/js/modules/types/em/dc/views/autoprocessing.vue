<template>
  <section>
    <div class="dcap">
      Movie:
      <a
        href="#"
        class="button prev"
        @click.prevent="prevMovie"
      ><i class="fa fa-angle-left" /></a>
      <input
        v-model.number="movieNumber"
        type="text"
        name="movie"
      >
      <a
        href="#"
        class="button next"
        @click.prevent="nextMovie"
      ><i class="fa fa-angle-right" /></a>
    </div>

    <motion-correction />
    <ctf />
  </section>
</template>

<script>
import store from 'app/store/store'
import MotionCorrectionModel from 'modules/types/em/models/motioncorrection'
import CtfModel from 'modules/types/em/models/ctf'
import MotionCorrection from 'modules/types/em/dc/views/motion-correction/motion-correction.vue'
import Ctf from 'modules/types/em/dc/views/ctf/ctf.vue'

export default {
    'name': "Autoprocessing",
    'components': {
        'motion-correction': MotionCorrection,
        'ctf': Ctf,
    },
    'props': {
        'collectionId': {
            'type': Number,
            'required': true,
        },
    },
    'emits': [
        'load:movie',
    ],
    'data': function() {
        return {
            'movieNumber': 1, // TODO: Vee Validate
            'motionCorrectionModel': new MotionCorrectionModel(
                this.modelParams('Motion Correction')
            ),
            'ctfModel': new CtfModel(
                this.modelParams('CTF')
            ),
        }
    },
    'watch': {
        'movieNumber': function() {
            this.movieNumberChanged()
        }
    },
    'created': function() {
        this.saveModel('emMotionCorrection', {})
        this.saveModel('emCtf', {})
    },
    'mounted': function() {
        this.movieNumberChanged()
    },
    'methods': {
        'prevMovie': function() {
            // There should be a way to disable buttons!
            if (this.movieNumber > 1) {
                this.movieNumber--
            }
        },
        'nextMovie': function() {
            // TODO: We don't know what the maximum is ?????
            // TODO: We need to know for the future "follow" button
            this.movieNumber++
        },
        'saveModel': function(name, data) {
            store.commit('saveBackboneModel', {
                'name': name,
                'model': data
            })
        },
        'modelParams': function(type) {
            return {
                'id': this.collectionId,
                'TYPE': type,
            }
        },
        'movieNumberChanged': function() {
            this.motionCorrectionModel.fetch(
                this.fetchParams('emMotionCorrection')
            )
            this.ctfModel.fetch(
                this.fetchParams('emCtf')
            )
            this.$emit('load:movie', this.movieNumber)
        },
        'fetchParams': function(saveAs) {
            const component = this
            return {
                'data': { IMAGENUMBER: this.movieNumber },
                'success': function (
                    model, // eslint-disable-line no-unused-vars
                    response,
                    options // eslint-disable-line no-unused-vars
                ) {
                    component.saveModel(saveAs, response)
                },
                'error': function (
                    model, // eslint-disable-line no-unused-vars
                    response, // eslint-disable-line no-unused-vars
                    options // eslint-disable-line no-unused-vars
                ) {
                    component.saveModel(saveAs, {})
                },
            }
        },
    },
}
</script>
