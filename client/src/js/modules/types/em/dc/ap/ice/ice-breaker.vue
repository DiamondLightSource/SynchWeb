<template>
  <processing-section
    section-title="Ice Breaker"
    :data-available="attachments.length > 0"
  >
    <parameter-list width="15%">
      <template v-for="(attachment, key) in attachments">
        <download
          v-if="key != 'id' && attachment.chartData === null"
          :key="attachment.id + 'p'"
          :attachment="attachment"
        />
      </template>
    </parameter-list>

    <template v-for="(attachment, key) in attachments">
      <plotly-dialog
        v-if="key != 'id' && attachment.chartData !== null"
        :key="attachment.id + 'h'"
        :title="attachment.chartData.titleText"
        :layout="attachment.chartData.layout"
        :chart-data="attachment.chartData.data"
      />
    </template>
  </processing-section>
</template>

<script>
import Download from 'modules/types/em/dc/ap/ice/download.vue'
import ParameterList from '../../../components/parameter-list.vue'
import PlotlyDialog from 'modules/types/em/components/plotly-dialog.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'
import StoreModule from 'modules/types/em/dc/ap/ice/store-module.js'

export default {
    'name': "IceBreaker",
    'components': {
        'download': Download,
        'parameter-list': ParameterList,
        'plotly-dialog': PlotlyDialog,
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
            'attachments': [],
        }
    },
    'beforeCreate': function() {
        if (! this.$store.hasModule('iceBreaker')) {
            this.$store.registerModule('iceBreaker', StoreModule);
        }
    },
    'mounted': function() {
        this.fetchData()
    },
    'beforeDestroy': function() {
        this.$store.unregisterModule('iceBreaker')
    },
    'methods': {
        'fetchData': function() {
            if (!this.autoProcProgramId) {
                return
            }
            this.$store.dispatch(
                'iceBreaker/fetch',
                this.autoProcProgramId
            ).then (
                (attachments) => {
                    this.attachments = attachments
                },
                () => {
                    this.attachments = []
                },
            )
        },
    },
}
</script>
