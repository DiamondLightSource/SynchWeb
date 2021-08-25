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
    'middleware': function(response) {
        return buildModel(response.xAxis, response.yAxis)
    },
    'defaultData': function() {
        return buildModel([], []);
    }
}
