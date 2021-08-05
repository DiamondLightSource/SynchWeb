<template>
  <section>
    <h1
      class="jobHeading"
      title="Click to show autoprocessing results"
      @click="showProcessing = !showProcessing"
    >
      <div>
        Processing Job: {{ processingJobId }}
      </div>
      <div>
        AutoProc Program: {{ autoProcProgramId }}
      </div>
      <div class="processTime">
        Processing Start: {{ job.PROCESSINGSTARTTIME }}
      </div>
      <div class="processTime">
        Processing End: {{ job.PROCESSINGSTARTTIME }}
      </div>
      <status-description :status="job.PROCESSINGSTATUSDESCRIPTION" />
    </h1>

    <div
      ref="processing"
      class="processing"
    >
      <template v-if="showProcessing">
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
      </template>
    </div>
  </section>
</template>

<script>
import 'jquery.mp' // TODO: JQuery!!!!
import AutoPicker from 'modules/types/em/dc/ap/cryolo/auto-picker.vue'
import CtfEstimation from 'modules/types/em/dc/ap/ctf/ctf-estimation.vue'
import IceBreaker from 'modules/types/em/dc/ap/ice/ice-breaker.vue'
import MotionCorrection from 'modules/types/em/dc/ap/mc/motion-correction.vue'
import SummaryCharts from 'modules/types/em/dc/ap/summary-charts/summary-charts.vue'
import StatusDescription from 'modules/types/em/dc/ap/status-description.vue'
import JobParameters from 'modules/types/em/dc/ap/parameters/job-parameters.vue'

export default {
    'name': 'ProcessingJob',
    'components': {
        'auto-picker': AutoPicker,
        'ctf-estimation': CtfEstimation,
        'ice-breaker': IceBreaker,
        'job-parameters': JobParameters,
        'motion-correction': MotionCorrection,
        'status-description': StatusDescription,
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
            'showProcessing': false,
            'lengthMc': 0,
            'lengthCtf': 0,
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
    },
    'watch': {
        'showProcessing': function(
            newValue,
            oldValue // eslint-disable-line no-unused-vars
        ) {
            const container = $(this.$refs.processing) // TODO: jQuery
            if (newValue) {
                container.slideDown()
            } else {
                container.slideUp()
            }
        },
    },
}
</script>

<style scoped>
.jobHeading {
    cursor: pointer;
    background: #afafaf;
    padding: 8px;
    font-size: 12px;
    margin-top: 2px;
    display: flex;
    justify-content: space-between;
}
.processTime {
    font-weight: bold;
}
.processing {
    background: #ffffff;
    overflow: auto;
}
</style>
