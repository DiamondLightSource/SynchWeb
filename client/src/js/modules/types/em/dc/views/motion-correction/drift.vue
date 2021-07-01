<template>
  <div
    ref="plot"
    class="distl"
    title="Drift Plot"
    :style="plotDivStyle"
    :data-chart="chart"
  />
</template>

<script>
import $ from 'jquery'
import 'jquery.flot'
import 'jquery.flot.resize'
import 'jquery.flot.selection'
import store from 'app/store/store'
import DriftModel from 'modules/types/em/models/drift'
import driftOptions from 'modules/types/em/dc/views/motion-correction/drift-options'
import proportionalHeight from 'modules/types/em/dc/views/proportional-height'

export default {
    'name': "Drift",
    'data': function() {
        return {
            'model': null,
            'plot': null,
        }
    },
    'computed': {
        'chart': function() {
            const state = store.state.models.emMotionCorrection
            // this is initially executed before this.$refs is ready
            // defer that first pass until the component is mounted
            if (Object.keys(this.$refs).length > 0) {
                this.updateAndPlot();
            }
            return state.DATACOLLECTIONID + '-' + state.IMAGENUMBER
        },
        'plotDivStyle': function() {
            const height = proportionalHeight() + 'px;'
            return 'height: ' + height +
                ' min-height: ' + height +
                ' max-height: ' + height
        },
    },
    'mounted': function () {
        this.model = new DriftModel({
            'id': store.state.models.emMotionCorrection.DATACOLLECTIONID
        })
        this.plot = $.plot(
            this.$refs.plot,
            this.plotData([]),
            driftOptions
        )
        // the first pass is deferred from this.computed.chart()
        this.updateAndPlot();
    },
    'destroyed': function () {
        this.model.stop()
        this.plot.shutdown()
    },
    'methods': {
        'plotData': function(rawData) {
            return [{ 'data': rawData, 'label': 'Drift' }]
        },
        'updateAndPlot': function() {
            const component = this
            const redraw = function(data) {
                component.plot.setData(component.plotData(data))
                component.plot.draw()
            }
            redraw([])
            this.model.fetch({
                'data': {
                    'IMAGENUMBER': store.state.models.emMotionCorrection.IMAGENUMBER
                },
                'success': function (
                    model, // eslint-disable-line no-unused-vars
                    response,
                    options // eslint-disable-line no-unused-vars
                ) {
                    console.log('drift', response)
                    redraw(response)
                }
            })
        },
    },
}
</script>
