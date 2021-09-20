<template>
  <section>
    <job-header
      :processing-job-id="processingJobId"
      :auto-proc-program-id="autoProcProgramId"
      :start-time="processingJob.processingStartTime"
      :end-time="processingJob.processingEndTime"
      :status="processingJob.processingStatusDescription"
      @hide="hide"
    />

    <div
      v-if="!hidden"
      class="processing"
    >
      <summary-charts
        :auto-proc-program-id="autoProcProgramId"
        :fetch-trigger="fetchTrigger"
      />

      <job-parameters :processing-job-id="processingJobId" />

      <motion-correction
        :auto-proc-program-id="autoProcProgramId"
        :fetch-trigger="fetchTrigger"
      />

      <ctf-estimation
        :auto-proc-program-id="autoProcProgramId"
        :fetch-trigger="fetchTrigger"
      />

      <ice-breaker
        :auto-proc-program-id="autoProcProgramId"
        :fetch-trigger="fetchTrigger"
      />

      <picker
        :auto-proc-program-id="autoProcProgramId"
        :fetch-trigger="fetchTrigger"
      />

      <classification
        :auto-proc-program-id="autoProcProgramId"
        :fetch-trigger="fetchTrigger"
      />
    </div>
  </section>
</template>

<script>
import Classification from 'modules/types/em/classification/classification.vue'
import CtfEstimation from 'modules/types/em/ctf/ctf-estimation.vue'
import IceBreaker from 'modules/types/em/ice/ice-breaker.vue'
import JobHeader from 'modules/types/em/processing-jobs/job-header.vue'
import JobParameters from 'modules/types/em/job-parameters/job-parameters.vue'
import MotionCorrection from 'modules/types/em/mc/motion-correction.vue'
import Picker from 'modules/types/em/picker/picker.vue'
import SummaryCharts from 'modules/types/em/ctf-summary/summary-charts.vue'

export default {
    'name': 'ProcessingJob',
    'components': {
        'classification': Classification,
        'ctf-estimation': CtfEstimation,
        'ice-breaker': IceBreaker,
        'job-header': JobHeader,
        'job-parameters': JobParameters,
        'motion-correction': MotionCorrection,
        'picker': Picker,
        'summary-charts': SummaryCharts,
    },
    'props': {
        'processingJob': {
            'type': Object,
            'required': true,
        },
        'collectionActive': {
            'type': Boolean,
            'required': true,
        },
    },
    'data': function() {
        return {
            'hidden': true,
        }
    },
    'computed': {
        'fetchTrigger': function() {
            const isRunning = [
                'submitted',
                'queued',
                'running',
            ].includes(this.processingJob.processingStatusDescription)

            return this.collectionActive && isRunning ?
                this.processingJob.fetchTime : ''
        },
        'processingJobId': function() {
            return parseInt(this.processingJob.processingJobId, 10)
        },
        'autoProcProgramId': function() {
            return parseInt(this.processingJob.autoProcProgramId, 10)
        },
    },
    'methods': {
        'hide': function(hidden) {
            this.hidden = hidden
        }
    }
}
</script>

<style scoped>
.processing {
    background: #ffffff;
    overflow: auto;
}
</style>
