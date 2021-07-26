<template>
  <div class="dcap clearfix">
    <h2>Ice Breaker</h2>
    <div
      class="data_collection"
      type="data"
    >
      <ul class="clearfix">
        <li
          v-for="attachment in attachments"
          :key="attachment.ID"
          class="comment"
        >
          <strong>{{ attachment.RECORDTIMESTAMP }}</strong>
          <span class="COMMENTS">{{ attachment.FILE }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import AttachmentsModel from 'modules/types/em/models/attachments'

export default {
    'name': "IceBreaker",
    'props': {
        'active' : {
            'type': Boolean,
            'required': true,
        },
        'dataCollectionId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'attachments': null,
        }
    },
    'computed': {
        'attachmentsModel': function() {
            return new AttachmentsModel({
                'id': this.dataCollectionId,
                'TYPE': 'Attachments',
            })
        },
    },
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'active': function(newValue, oldValue) {
            this.fetchAttachments()
        },
    },
    'mounted': function() {
        this.fetchAttachments()
    },
    'methods': {
        'fetchAttachments': function() {
            const vm = this
            if (vm.active == false) {
                return
            }
            vm.$store.commit('loading', true)
            const successCallback = function(
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                vm.$store.commit('loading', false)
                vm.attachments = response
            }
            const errorCallback = function (
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                vm.$store.commit('loading', false)
                console.log(response.responseJSON)
                vm.$store.commit('notifications/addNotification', {
                    'title': 'Error',
                    'message': 'Could not retrieve auto-processing attachments',
                    'level': 'error'
                })
            }
            vm.$store.commit('loading', true)
            /* TODO: [SCI-9935]
               vm.$store.dispatch('getModel', model)
               doesn't currently support 'data': */
            vm.attachmentsModel.fetch({
                'success': successCallback,
                'error': errorCallback,
            })
        },
    },
}
</script>
