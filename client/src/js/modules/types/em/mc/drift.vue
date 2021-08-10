<template>
  <chart
    :options="chartOptions"
    :plot-data="chartData"
  />
</template>

<script>
import Chart from 'modules/types/em/components/chart.vue'
import DriftModel from 'modules/types/em/models/drift'
import driftOptions from 'modules/types/em/mc/drift-options'

export default {
    'name': "Drift",
    'components': {
        'chart': Chart,
    },
    'props': {
        'autoProcProgramId' : {
            'type': Number,
            'required': true,
        },
        'movieNumber': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'chartOptions': driftOptions,
            'chartData': '',
        }
    },
    'computed': {
        'driftModel': function() {
            return new DriftModel({ 'id': this.autoProcProgramId })
        },
    },
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'movieNumber': function(newValue, oldValue) {
            this.updateAndPlot();
        },
    },
    'mounted': function () {
        this.updateAndPlot();
    },
    'beforeUnmount': function () {
        this.driftModel.stop()
    },
    'methods': {
        'updateAndPlot': function() {
            const vm = this
            const successCallback = function (
                model,
                response, // eslint-disable-line no-unused-vars
                options // eslint-disable-line no-unused-vars
            ) {
                vm.chartData = model.attributes.drift
                vm.$store.commit('loading', false)
            }
            const errorCallback = function (
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                console.log('drift error', response)
                vm.$store.commit('loading', false)
            }
            vm.$store.commit('loading', true)
            this.driftModel.fetch({
                'data': { 'IMAGENUMBER': this.movieNumber },
                'success': successCallback,
                'error': errorCallback,
            })
        },
    },
}
</script>
