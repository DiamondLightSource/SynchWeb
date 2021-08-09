import Backbone from 'backbone'

export default {
    'namespaced': true,
    'state': {
        'available': false,
        'xAxis': [],
        'astigmatism': [],
        'estimatedFocus': [],
        'estimatedResolution': [],
    },
    'mutations': {
        fetched(state, response) {
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
            state.available = dataAvailable
            state.xAxis = xAxis
            state.astigmatism = charts.ASTIGMATISM
            state.estimatedFocus = charts.ESTIMATEDDEFOCUS
            state.estimatedResolution = charts.ESTIMATEDRESOLUTION
        }
    },
    'actions': {
        fetch(context, autoProcProgramId) {
            const store = this
            store.commit('loading', true)
            return new Promise((resolve, reject) => {
                Backbone.ajax({
                    'type': 'GET',
                    'url': store.state.apiUrl +
                        '/em/ctf/summary/' + autoProcProgramId,
                    'success': function (
                        response,
                        status, // eslint-disable-line no-unused-vars
                        xhr // eslint-disable-line no-unused-vars
                    ) {
                        store.commit('ctfSummary/fetched', response)
                        store.commit('loading', false)
                        console.log('fetched CTF summary data', store.state.ctfSummary)
                        resolve()
                    },
                    'error': function(
                        model, // eslint-disable-line no-unused-vars
                        response,
                        options // eslint-disable-line no-unused-vars
                    ) {
                        store.commit('loading', false)
                        reject(response.responseJSON || {
                            'status': 400, 'message': 'Error summary CTF data'
                        })
                    },
                })
            })
        },
    },
}
