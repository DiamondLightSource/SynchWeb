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

        <div
          v-if="showReprocessButton"
          class="reprocess-button"
        >
          <reprocess-button
            :default-parameters="parameters"
            @fetch="$emit('fetch-parameters')"
          />
        </div>

        <hide-button v-model="hidden" />
      </div>
    </div>
  </h1>
</template>

<script>
import HideButton from 'modules/types/em/components/hide-button.vue'
import StatusDescription from 'modules/types/em/processing-jobs/status-description.vue'
import ReprocessButton from 'modules/types/em/components/reprocess-button.vue'
import StopButton from 'modules/types/em/processing-jobs/stop-button.vue'

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
            'type': String,
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
        'processingAllowed': {
            'type': Boolean,
            'required': true,
        },
        'parameters': {
            'type': Object,
            'required': true,
        },
        'defaultHidden': {
            'type': Boolean,
            'required': true,
        }
    },
    'data': function() {
        return { 'hidden': this.defaultHidden  }
    },
    'computed': {
        'showReprocessButton': function() {
            return this.processingAllowed && [
                'success',
                'failure',
            ].includes(this.status)
        },
    },
    'watch': {
        'hidden': function() {
            this.$emit('hide', this.hidden)
        }
    },
}
</script>

<style scoped>
.job-header {
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
.reprocess-button {
    margin-right: 5px;
}
</style>
