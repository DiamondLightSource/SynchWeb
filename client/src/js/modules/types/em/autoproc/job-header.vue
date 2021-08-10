<template>
  <h1 class="job-header">
    <div class="column">
      Processing Job: {{ processingJobId }}
    </div>

    <div class="column">
      AutoProc Program: {{ autoProcProgramId ? autoProcProgramId : 'NONE' }}
    </div>

    <div class="column process-time">
      Processing Start: {{ startTime ? startTime : 'Not started' }}
    </div>

    <div class="column process-time">
      Processing End: {{ endTime ? endTime : 'Not finished' }}
    </div>

    <div class="last-column">
      <status-description :status="status" />
      <div class="buttons">
        <stop-button
          :status="status"
          :processing-job-id="processingJobId"
        />
        <hide-button v-model="hidden" />
      </div>
    </div>
  </h1>
</template>

<script>
import HideButton from 'modules/types/em/components/hide-button.vue'
import StatusDescription from 'modules/types/em/autoproc/status-description.vue'
import StopButton from 'modules/types/em/autoproc/stop-button.vue'

export default {
    'name': 'JobHeader',
    'components': {
        'hide-button': HideButton,
        'status-description': StatusDescription,
        'stop-button': StopButton,
    },
    'props': {
        'processingJobId': {
            'type': Number,
            'required': true,
        },
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
        'startTime': {
            'type': String,
            'required': true,
        },
        'endTime': {
            'type': String,
            'required': true,
        },
        'status': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return { 'hidden': true  }
    },
    'watch': {
        'hidden': function() {
            this.$emit('hide', this.hidden)
        }
    }
}
</script>

<style scoped>
.job-header {
    cursor: pointer;
    background: #afafaf;
    padding: 8px;
    font-size: 12px;
    margin-top: 2px;
    display: flex;
    justify-content: space-between;
}
.column {
    width: 21%;
}
.last-column {
    width: 16%;
    display: flex;
    justify-content: space-between;
}
.process-time {
    font-weight: bold;
}
.buttons {
    display: flex;
    justify-content: flex-end;
}
</style>
