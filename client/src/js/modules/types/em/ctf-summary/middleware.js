export default function(response) {
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

    return {
        'points': response.length,
        'astigmatism': chartData('ASTIGMATISM'),
        'estimatedFocus': chartData('ESTIMATEDDEFOCUS'),
        'estimatedResolution': chartData('ESTIMATEDRESOLUTION'),
    }
}
