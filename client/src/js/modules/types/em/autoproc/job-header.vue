<template>
  <h1 class="job-header">
    <div class="column">
      Processing Job: {{ processingJobId }}
    </div>

    <div class="column">
      AutoProc Program: {{ autoProcProgramId ? autoProcProgramId : 'NONE' }}
    </div>

    <div class="column">
      Processing Start:
      <strong v-if="startTime">{{ startTime }}</strong>
      <span v-else>Not started</span>
    </div>

    <div class="column">
      Processing End:
      <strong v-if="endTime">{{ endTime }}</strong>
      <span v-else>Not finished</span>
    </div>

    <div class="last-column">
      <status-description :status="status" />
      <div class="header-buttons">
        <stop-button
          :status="status"
          :processing-job-id="processingJobId"
        />
        <reprocess-button
          :status="status"
        />
        <hide-button v-model="hidden" />
      </div>
    </div>
  </h1>
</template>

<script>
import HideButton from 'modules/types/em/components/hide-button.vue'
import ReprocessButton from 'modules/types/em/autoproc/reprocess-button.vue'
import StatusDescription from 'modules/types/em/autoproc/status-description.vue'
import StopButton from 'modules/types/em/autoproc/stop-button.vue'

export default {
    'name': 'JobHeader',
    'components': {
        'hide-button': HideButton,
        'reprocess-button': ReprocessButton,
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
            'default': '',
        },
        'endTime': {
            'type': String,
            'default': '',
        },
        'status': {
            'type': String,
            'default': '',
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
    background: #555;
    color: #fff;
    padding: 8px;
    font-size: 14px;
    margin-top: 2px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.column {
    width: 21%;
}
.last-column {
    width: 16%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.header-buttons {
    display: flex;
    justify-content: flex-end;
}
.header-button {
    margin-right: 5px;
}
</style>
