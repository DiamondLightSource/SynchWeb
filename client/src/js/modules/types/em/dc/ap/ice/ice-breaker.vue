<template>
  <processing-section
    section-title="Ice Breaker"
    :data-available="attachments !== null"
  >
    <parameter-list width="15%">
      <pdf-attachment
        v-for="attachment in attachments"
        :key="attachment.ID"
        :attachment="attachment"
      />
    </parameter-list>

    <histogram
      v-for="attachment in attachments"
      :key="attachment.ID"
      :attachment="attachment"
    />
  </processing-section>
</template>

<script>
import AttachmentsModel from 'modules/types/em/models/attachments'
import Histogram from 'modules/types/em/dc/ap/ice/histogram.vue'
import ParameterList from '../../../components/parameter-list.vue'
import PdfAttachment from 'modules/types/em/dc/ap/ice/pdf-attachment.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': "IceBreaker",
    'components': {
        'histogram': Histogram,
        'parameter-list': ParameterList,
        'pdf-attachment': PdfAttachment,
        'processing-section': ProcessingSection,
    },
    'props': {
        'autoProcProgramId': {
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
            return new AttachmentsModel({ 'id': this.autoProcProgramId })
        },
    },
    'mounted': function() {
        this.fetchAttachments()
    },
    'methods': {
        'fetchAttachments': function() {
            const vm = this
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
