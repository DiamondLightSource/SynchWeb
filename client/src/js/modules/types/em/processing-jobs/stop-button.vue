<template>
  <div
    v-if="showButton"
    class="stop-button"
  >
    <dialog-modal
      :show-dialog="showConfirmation"
      title="Are You Sure"
      confirm-label="Yes"
      cancel-label="No"
      @confirm="confirmed"
      @cancel="showConfirmation = false"
    >
      Are you sure you want to stop processing job
      {{ processingJobId }}?
    </dialog-modal>

    <flat-button
      level="danger"
      @click="showConfirmation = true"
    >
      <i class="fa fa-ban" />
    </flat-button>
  </div>
</template>

<script>
import Backbone from 'backbone'
import FlatButton from 'app/components/flat-button.vue'
import DialogModal from 'app/components/dialog-modal.vue'

export default {
    'name': 'StopButton',
    'components': {
        'flat-button': FlatButton,
        'dialog-modal': DialogModal,
    },
    'props': {
        'status': {
            'type': String,
            'required': true,
        },
        'processingJobId': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'showConfirmation': false,
        }
    },
    'computed': {
        'showButton': function() {
            return [
                'submitted',
                'queued',
                'running',
            ].indexOf(this.status) != -1
        },
        'stopUrl': function () {
            return this.$store.state.apiUrl +
                '/em/process/relion/job/' + this.processingJobId
        },
    },
    'methods': {
        'confirmed': function() {
            const vm = this
            vm.showConfirmation = false
            vm.$store.commit('notifications/addNotification', {
                'title': 'INFO',
                'message': 'Requesting stop processing job ' + this.jobId +
                    ' - processing jobs will refresh in 5 seconds ',
                'level': 'info'
            })
            vm.$store.commit('loading', true)
            Backbone.ajax({
                'type': 'PATCH',
                'url': vm.stopUrl,
                'success': function (
                    response, // eslint-disable-line no-unused-vars
                    status, // eslint-disable-line no-unused-vars
                    xhr // eslint-disable-line no-unused-vars
                ) {
                    vm.$store.commit('loading', false)
                },
                'error': function (
                    model,
                    response, // eslint-disable-line no-unused-vars
                    options // eslint-disable-line no-unused-vars
                ) {
                    vm.$store.commit('loading', false)
                    vm.$store.commit('notifications/addNotification', {
                        'title': 'Error',
                        'message': 'Failed to stop job: ' +
                            JSON.parse(model.responseText).message,
                        'level': 'error'
                    })
                }
            })
        },
    },
}
</script>

<style>
.stop-button {
    margin-right: 5px;
}
</style>
