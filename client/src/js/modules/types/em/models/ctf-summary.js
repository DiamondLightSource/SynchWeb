define(['backbone'], function(Backbone) {
    return Backbone.Model.extend({
        'urlRoot': '/em/ctf/summary',
        'parse': function(
            response,
            options // eslint-disable-line no-unused-vars
        ) {
            var charts = {
                'ASTIGMATISM': {
                    'label': 'Astigmatism',
                    'color': '#F00',
                    'data': [],
                },
                'ESTIMATEDDEFOCUS': {
                    'label': 'Estimated Focus',
                    'color': '#0F0',
                    'data': [],
                },
                'ESTIMATEDRESOLUTION': {
                    'label': 'Estimated Resolution',
                    'color': '#00F',
                    'data': [],
                },
            }
            var dataAvailable = false
            response.summary.forEach(function(row) {
                Object.keys(charts).forEach(function(chart) {
                    charts[chart].data.push([row.TIME, row[chart]])
                    dataAvailable = true
                })
            })
            var wrappedData = { 'dataAvailable': dataAvailable }
            Object.keys(charts).forEach(function(chart) {
                // stringify data to stop Vue "polluting" it with observers.
                wrappedData[chart] = JSON.stringify(charts[chart])
            })
            return wrappedData
        },

    })
})
