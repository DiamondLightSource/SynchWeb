import baseViewModel from 'modules/types/em/components/view-model'

const buildModel = function(xAxis, yAxis) {
    return {
        'chartData': JSON.stringify([{
            'x': xAxis,
            'y': yAxis,
            'type': 'scatter',
            'mode': 'lines+markers',
        }]),
        'points': xAxis.length,
    }
}

export default {
    'fetch': function(store, autoProcProgramId, movieNumber) {
        return baseViewModel(
            store,
            '/em/mc/drift/' + autoProcProgramId + '/n/' + movieNumber,
            'MC Drift',
            function(response) {
                return buildModel(response.xAxis, response.yAxis)
            }
        )
    },
    'defaultData': function() {
        return buildModel([], []);
    }
}
