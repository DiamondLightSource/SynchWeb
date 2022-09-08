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
      <div class="message">
        Are you sure you want to stop processing job
        {{ processingJobId }}?
      </div>
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
            return ['submitted', 'queued', 'running'].includes(this.status)
        },
    },
    'methods': {
        'confirmed': function() {
            const vm = this
            const humanName = 'Stop Processing Job ' + vm.processingJobId
            vm.showConfirmation = false
            vm.$store.dispatch('em/api/fetch', {
                'url': 'relion/stop/' + this.processingJobId,
                'humanName': humanName
            }).then(
                (response) => {
                    vm.$store.commit('notifications/addNotification', {
                        'title': 'INFO',
                        'message': humanName,
                        'level': 'info'
                    })
                    console.log(humanName, response)
                }
            )
        },
    },
}
</script>

<style scoped>
.stop-button {
    margin-right: 5px;
}
.message {
    margin-top: 30px;
    margin-bottom: 30px;
    margin-left: 10px;
    margin-right: 5px;
}
</style>
