import baseViewModel from 'modules/types/em/components/view-model'

const buildModel = function(
    points, astigmatism, estimatedFocus, estimatedResolution
) {
    return {
        'points': points,
        'astigmatism': astigmatism,
        'estimatedFocus': estimatedFocus,
        'estimatedResolution': estimatedResolution,
    }
}

const middleware = function(response) {
    var xAxis = []
    var yAxes = {
        'ASTIGMATISM': [],
        'ESTIMATEDDEFOCUS': [],
        'ESTIMATEDRESOLUTION': [],
    }
    const chartData = function (key) {
        return JSON.stringify([{ 'x': xAxis, 'y': yAxes[key], 'type': 'bar' }])
    }

    response.forEach(function(row) {
        xAxis.push(row.MOVIENUMBER)
        Object.keys(yAxes).forEach(function(chart) {
            yAxes[chart].push(row[chart])
        })
    })

    return buildModel(
        response.length,
        chartData('ASTIGMATISM'),
        chartData('ESTIMATEDDEFOCUS'),
        chartData('ESTIMATEDRESOLUTION')
    )
}

export default {
    'fetch': function(store, autoProcProgramId) {
        return baseViewModel(
            store,
            '/em/ctf/summary/' + autoProcProgramId,
            'CTF summary data',
            middleware
        )
    },
    'defaultData': function() {
        return buildModel(0, '', '', '')
    },
}
