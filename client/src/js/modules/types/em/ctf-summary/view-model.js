import baseViewModel from 'modules/types/em/components/view-model'

const buildModel = function(
    available,
    xAxis,
    astigmatism,
    estimatedFocus,
    estimatedResolution
) {
    return {
        'available': available,
        'xAxis': xAxis,
        'astigmatism': astigmatism,
        'estimatedFocus': estimatedFocus,
        'estimatedResolution': estimatedResolution,
    }
}

const middleware = function(response) {
    var xAxis = []
    var charts = {
        'ASTIGMATISM': [],
        'ESTIMATEDDEFOCUS': [],
        'ESTIMATEDRESOLUTION': [],
    }
    var dataAvailable = false
    response.forEach(function(row) {
        xAxis.push(row.MOVIENUMBER)
        dataAvailable = true
        Object.keys(charts).forEach(function(chart) {
            charts[chart].push(row[chart])
        })
    })
    return buildModel(
        dataAvailable,
        xAxis,
        charts.ASTIGMATISM,
        charts.ESTIMATEDDEFOCUS,
        charts.ESTIMATEDRESOLUTION
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
        return buildModel(false, [], [], [], [])
    },
}
