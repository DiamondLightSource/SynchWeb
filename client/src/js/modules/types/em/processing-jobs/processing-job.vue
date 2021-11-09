<template>
  <section>
    <job-header
      :processing-job-id="processingJobId"
      :auto-proc-program-id="autoProcProgramId"
      :start-time="processingJob.processingStartTime"
      :end-time="processingJob.processingEndTime"
      :status="processingJob.processingStatusDescription"
      :processing-allowed="processingAllowed"
      :parameters="parameters"
      :default-hidden="defaultHidden"
      @hide="hide"
      @fetch-parameters="fetchParameters"
    />

    <div
      v-if="!hidden"
      class="processing"
    >
      <summary-charts
        :auto-proc-program-id="autoProcProgramId"
        :fetch-trigger="fetchTrigger"
      />

      <processing-section
        section-title="Processing Job Parameters"
        :data-available="Object.keys(parameters).length > 0"
        default-hidden
        @toggle="fetchParameters"
      >
        <parameter-list-with-schema
          schema-name="Relion Schema"
          schema-url="relion/schema/"
          :parameters="parameters"
        />
      </processing-section>

      <motion-correction
        :auto-proc-program-id="autoProcProgramId"
        :max="mcCount"
      />

      <ctf-estimation
        :auto-proc-program-id="autoProcProgramId"
        :max="ctfCount"
      />

      <ice-breaker
        :auto-proc-program-id="autoProcProgramId"
        :fetch-trigger="fetchTrigger"
      />

      <picker
        :auto-proc-program-id="autoProcProgramId"
        :max="pickCount"
      />

      <classification-2d
        :auto-proc-program-id="autoProcProgramId"
        :fetch-trigger="fetchTrigger"
      />
    </div>
  </section>
</template>

<script>
import Classification2D from 'modules/types/em/classification-2d/classification.vue'
import CtfEstimation from 'modules/types/em/ctf/ctf-estimation.vue'
import IceBreaker from 'modules/types/em/ice/ice-breaker.vue'
import JobHeader from 'modules/types/em/processing-jobs/job-header.vue'
import MotionCorrection from 'modules/types/em/mc/motion-correction.vue'
import ParameterListWithSchema from 'modules/types/em/components/parameter-list-with-schema.vue'
import Picker from 'modules/types/em/picker/picker.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'
import SummaryCharts from 'modules/types/em/ctf-summary/summary-charts.vue'

export default {
    'name': 'ProcessingJob',
    'components': {
        'classification-2d': Classification2D,
        'ctf-estimation': CtfEstimation,
        'ice-breaker': IceBreaker,
        'job-header': JobHeader,
        'motion-correction': MotionCorrection,
        'parameter-list-with-schema': ParameterListWithSchema,
        'picker': Picker,
        'processing-section': ProcessingSection,
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
        'processingAllowed': {
            'type': Boolean,
            'required': true,
        },
        'defaultHidden': {
            'type': Boolean,
            'default': false,
        },
    },
    'data': function() {
        return {
            'hidden': this.defaultHidden,
            'parameters': {},
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
            return this.processingJob.processingJobId ?
                this.processingJob.processingJobId : ''
        },
        'autoProcProgramId': function() {
            return this.processingJob.autoProcProgramId ?
                this.processingJob.autoProcProgramId : ''
        },
        'mcCount': function() {
            return this.processingJob.mcCount < this.processingJob.movieCount ?
                this.processingJob.mcCount : this.processingJob.movieCount
        },
        'ctfCount': function() {
            return this.processingJob.ctfCount < this.processingJob.movieCount ?
                this.processingJob.ctfCount : this.processingJob.movieCount
        },
        'pickCount': function() {
            return this.processingJob.pickCount < this.processingJob.movieCount ?
                this.processingJob.pickCount : this.processingJob.movieCount
        },
    },
    'watch': {
        'processingJob': function() {
            this.checkAnomalousMovieCounts()
        },
    },
    'mounted': function() {
        this.checkAnomalousMovieCounts()
    },
    'methods': {
        'hide': function(hidden) {
            this.hidden = hidden
        },
        'fetchParameters': function() {
            if (Object.keys(this.parameters).length == 0) {
                this.$store.dispatch('em/api/fetch', {
                    'url': 'relion/parameters/' +
                        this.processingJob.processingJobId,
                    'humanName': 'Processing Job Parameters',
                }).then(
                    (response) => { this.parameters = response }
                )
            }
        },
        'checkAnomalousMovieCounts': function() {
            var messages = []
            const movieCount = this.processingJob.movieCount
            for (const [field, title] of Object.entries({
                'mcCount': 'Motion Correction',
                'ctfCount': 'CTF',
                'pickCount': 'Picker',
            })) {
                const count = this.processingJob[field]
                if (count > movieCount) {
                    messages.push(title + ' has ' + count + ' entries')
                }
            }
            if (messages.length > 0) {
                messages.unshift('There are only ' + movieCount + ' movies')
                const message = messages.join(' and ') +
                    ' (Job: ' + this.processingJob.processingJobId + ')'
                this.$store.commit('notifications/addNotification', {
                    'title': 'Movie count anomaly',
                    'message': message,
                    'level': 'warning'
                })
                console.log('Movie count anomaly: ' + message)
            }
        },
    },
}
</script>

<style scoped>
.processing {
    background: #ffffff;
    overflow: auto;
}
</style>
