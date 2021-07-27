<template>
  <div
    ref="plot"
    class="distl"
    title="Drift Plot"
    :style="plotDivStyle"
  />
</template>

<script>
import $ from 'jquery'
import 'jquery.flot'
import 'jquery.flot.resize'
import 'jquery.flot.selection'
import DriftModel from 'modules/types/em/models/drift'
import driftOptions from 'modules/types/em/dc/ap/mc/drift-options'
import proportionalHeight from 'modules/types/em/components/proportional-height'

export default {
    'name': "Drift",
    'mixins': [proportionalHeight],
    'props': {
        'dataCollectionId' : {
            'type': Number,
            'required': true,
        },
        'movieNumber': {
            'type': Number,
            'required': true,
        },
    },
    'computed': {
        'driftModel': function() {
            return new DriftModel({ 'id': this.dataCollectionId })
        },
        'plot': function() {
            return $.plot(
                this.$refs.plot,
                this.plotData([]),
                driftOptions
            )
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
        this.plot.shutdown()
    },
    'methods': {
        'plotData': function(rawData) {
            return [{ 'data': rawData, 'label': 'Drift' }]
        },
        'updateAndPlot': function() {
            const vm = this
            vm.$store.commit('loading', true)
            const redraw = function(data) {
                vm.plot.setData(vm.plotData(data))
                vm.plot.draw()
            }
            const successCallback = function (
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                vm.$store.commit('loading', false)
                // console.log('drift', response)
                redraw(response)
            }
            const errorCallback = function (
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                vm.$store.commit('loading', false)
                console.log('drift error', response)
            }
            // First plot a blank chart to clear existing data
            redraw([])
            this.driftModel.fetch({
                'data': { 'IMAGENUMBER': this.movieNumber },
                'success': successCallback,
                'error': errorCallback,
            })
        },
    },
}
</script>
