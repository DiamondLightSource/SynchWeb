<template>
  <section>
    <h1>Processing Job: {{ job.ID }}</h1>

    <h1 style="background-color: #ffa; padding: 20px;">
      TODO: astigmatism, estimated focus &amp; estimated resolution graphs
    </h1>

    <div class="holder">
      <h1
        title="Click to show autoprocessing results"
        class="ap"
        @click="clickHeader"
      >
        Auto Processing
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
      </div>
    </div>
  </section>
</template>

<script>
import 'jquery.mp' // TODO: JQuery!!!!
import CtfEstimation from 'modules/types/em/dc/ap/ctf/ctf-estimation.vue'
import MotionCorrection from 'modules/types/em/dc/ap/mc/motion-correction.vue'
import StatusItem from 'modules/types/em/dc/ap/status-item.vue'

export default {
    'name': 'ProcessingJob',
    'components': {
        'ctf-estimation': CtfEstimation,
        'motion-correction': MotionCorrection,
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
