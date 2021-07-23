<template>
  <div class="holder">
    <h1
      title="Click to show autoprocessing results"
      class="ap"
      @click="clickHeader"
    >
      Processing Job: {{ processingJobId }}
      <span>
        <status-item
          title="Motion Correction"
          :status="job.MC"
          @counted="countedMc"
        />
        <status-item
          title="CTF Estimation"
          :status="job.CTF"
          @counted="countedCtf"
        />
      </span>
    </h1>

    <div
      ref="autoproc"
      class="autoproc"
    >
      <processing-summary :processing-job-id="processingJobId" />

      <motion-correction
        :active="showAutoProcessing"
        :length="lengthMc"
        :data-collection-id="dataCollectionId"
      />

      <ctf-estimation
        :active="showAutoProcessing"
        :length="lengthCtf"
        :data-collection-id="dataCollectionId"
      />

      <ice-breaker
        :active="showAutoProcessing"
        :data-collection-id="dataCollectionId"
      />

      <auto-picker
        :active="showAutoProcessing"
        :data-collection-id="dataCollectionId"
      />
    </div>
  </div>
</template>

<script>
import 'jquery.mp' // TODO: JQuery!!!!
import AutoPicker from 'modules/types/em/dc/ap/cryolo/auto-picker.vue'
import CtfEstimation from 'modules/types/em/dc/ap/ctf/ctf-estimation.vue'
import IceBreaker from 'modules/types/em/dc/ap/ice/ice-breaker.vue'
import MotionCorrection from 'modules/types/em/dc/ap/mc/motion-correction.vue'
import ProcessingSummary from 'modules/types/em/dc/ap/summary/processing-summary.vue'
import StatusItem from 'modules/types/em/dc/ap/status-item.vue'

export default {
    'name': 'ProcessingJob',
    'components': {
        'auto-picker': AutoPicker,
        'ctf-estimation': CtfEstimation,
        'ice-breaker': IceBreaker,
        'motion-correction': MotionCorrection,
        'processing-summary': ProcessingSummary,
        'status-item': StatusItem,
    },
    'props': {
        'job': {
            'type': Object,
            'required': true,
        },
        'dataCollectionId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'showAutoProcessing': false,
            'lengthMc': 0,
            'lengthCtf': 0,
        }
    },
    'computed': {
        'processingJobId': function() {
            return parseInt(this.job.ID, 10)
        },
    },
    'methods': {
        // This would be better using modern idioms rather than using JQuery
        // But it'd require more changes to the global style sheets and
        // JQuery does the job for now
        'clickHeader': function() {
            $(this.$refs.autoproc).slideToggle()
            this.showAutoProcessing = !this.showAutoProcessing
        },
        'countedMc': function(length) {
            this.lengthMc = length
        },
        'countedCtf': function(length) {
            this.lengthCtf = length
        },
    },
}
</script>
