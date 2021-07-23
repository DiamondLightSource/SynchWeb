<template>
  <div
    v-if="ctfSummaryData !== null"
    class="clearfix"
  >
    <summary-chart
      v-for="(plotData, key) in ctfSummaryData"
      :key="key"
      :plot-data="plotData"
    />
  </div>
</template>

<script>
import CtfSummaryModel from 'modules/types/em/models/ctf-summary'
import SummaryChart from 'modules/types/em/dc/ap/summary/summary-chart.vue'

export default {
    'name': 'ProcessingSummary',
    'components': {
        'summary-chart': SummaryChart,
    },
    'props': {
        'processingJobId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function () {
        return {
            'ctfSummaryData': null,
        }
    },
    'computed': {
        'ctfSummaryModel': function() {
            return new CtfSummaryModel({
                'id': this.processingJobId,
            })
        },
    },
    'mounted': function() {
        this.fetchSummaryModel()
    },
    'methods': {
        'fetchSummaryModel': function() {
            const vm = this
            const successCallback = function(
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                vm.$store.commit('loading', false)
                // This, rather convoluted, operation is to stop Vue "polluting"
                // the chart data with observers.
                var wrappedData = {}
                Object.keys(response).forEach(function (key) {
                    wrappedData[key] = JSON.stringify(response[key])
                })
                vm.ctfSummaryData = wrappedData
                console.log('fetched summary data', vm.ctfSummaryData)
            }
            const errorCallback = function(
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                vm.$store.commit('loading', false)
                console.log(response.responseJSON)
                vm.$store.commit('notifications/addNotification', {
                    'title': 'Error',
                    'message': 'Could not retrieve autoprocessing summary',
                    'level': 'error'
                })
            }
            vm.$store.commit('loading', true)
            /* TODO: [SCI-9935]
                vm.$store.dispatch('getModel', model)
                doesn't currently support 'data': */
            vm.ctfSummaryModel.fetch({
                'success': successCallback,
                'error': errorCallback,
            })
        },
    },
}
</script>
