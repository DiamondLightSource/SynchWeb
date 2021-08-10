<template>
  <section>
    <job-header
      :processing-job-id="processingJobId"
      :auto-proc-program-id="autoProcProgramId"
      :start-time="job.PROCESSINGSTARTTIME"
      :end-time="job.PROCESSINGENDTIME"
      :status="job.PROCESSINGSTATUSDESCRIPTION"
      @hide="hide"
    />

    <div
      class="processing"
      v-if="!hidden"
    >
      <summary-charts
        :auto-proc-program-id="autoProcProgramId"
      />

      <job-parameters
        :processing-job-id="processingJobId"
      />

      <motion-correction
        :auto-proc-program-id="autoProcProgramId"
        :movie-count="mcMovieCount"
      />

      <ctf-estimation
        :auto-proc-program-id="autoProcProgramId"
        :movie-count="ctfMovieCount"
      />

      <ice-breaker
        :auto-proc-program-id="autoProcProgramId"
      />

      <auto-picker
        :auto-proc-program-id="autoProcProgramId"
      />
    </div>
  </section>
</template>

<script>
import AutoPicker from 'modules/types/em/cryolo/auto-picker.vue'
import CtfEstimation from 'modules/types/em/ctf/ctf-estimation.vue'
import IceBreaker from 'modules/types/em/ice/ice-breaker.vue'
import JobHeader from 'modules/types/em/autoproc/job-header.vue'
import JobParameters from 'modules/types/em/job-parameters/job-parameters.vue'
import MotionCorrection from 'modules/types/em/mc/motion-correction.vue'
import SummaryCharts from 'modules/types/em/ctf-summary/summary-charts.vue'

export default {
    'name': 'ProcessingJob',
    'components': {
        'auto-picker': AutoPicker,
        'ctf-estimation': CtfEstimation,
        'ice-breaker': IceBreaker,
        'job-header': JobHeader,
        'job-parameters': JobParameters,
        'motion-correction': MotionCorrection,
        'summary-charts': SummaryCharts,
    },
    'props': {
        'job': {
            'type': Object,
            'required': true,
        },
    },
    'data': function() {
        return {
            'hidden': true,
        }
    },
    'computed': {
        'processingJobId': function() {
            return parseInt(this.job.PROCESSINGJOBID, 10)
        },
        'autoProcProgramId': function() {
            return parseInt(this.job.AUTOPROCPROGRAMID, 10)
        },
        'mcMovieCount': function() {
            return parseInt(this.job.MCCOUNT, 10)
        },
        'ctfMovieCount': function() {
            return parseInt(this.job.CTFCOUNT, 10)
        },
        'startTime': function() {
            const time = this.job.PROCESSINGSTARTTIME
            return time ? time : 'Not started'
        },
        'endTime': function () {
            const time = this.job.PROCESSINGENDTIME
            return time ? time : 'Not finished'
        },
        'status': function() {
            return this.job.PROCESSINGSTATUSDESCRIPTION
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
