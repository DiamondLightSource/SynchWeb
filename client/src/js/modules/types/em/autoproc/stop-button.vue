<template>
  <div
    v-if="showButton"
    class="stop-button"
  >
    <dialog-confirmation
      :is-active="showConfirmation"
      :message="confirmationMessage"
      title="Are You Sure"
      confirm-label="Yes"
      cancel-label="No"
      @confirm="confirmed"
      @cancel="showConfirmation = false"
    />

    <base-input-button
      type="danger"
      @click="showConfirmation = true"
    >
      <i class="fa fa-times" />
    </base-input-button>
  </div>
</template>

<script>
import Backbone from 'backbone'
import BaseInputButton from 'app/components/base-input-button.vue'
import DialogConfirmation from 'app/components/dialog-confirmation.vue'

export default {
    'name': 'StopButton',
    'components': {
        'base-input-button': BaseInputButton,
        'dialog-confirmation': DialogConfirmation,
    },
    'props': {
        'status': {
            'type': String,
            'required': true,
        },
        'processingJobId': {
            'type': Number,
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
        'confirmationMessage': function() {
            return 'Are you sure you want to stop processing job ' +
                    this.processingJobId + '?'
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