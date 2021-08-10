import Backbone from 'backbone'

const parse = function(response) {
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
    return {
        'available': dataAvailable,
        'xAxis': xAxis,
        'astigmatism': charts.ASTIGMATISM,
        'estimatedFocus': charts.ESTIMATEDDEFOCUS,
        'estimatedResolution': charts.ESTIMATEDRESOLUTION,
    }
}

export default {
    'namespaced': true,
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
                        // we can't have this stored in a state in VueX
                        // because there may be multiple processing jobs
                        // open at any one time.
                        const parsed = parse(response)
                        store.commit('loading', false)
                        console.log('fetched CTF summary data', parsed)
                        resolve(parsed)
                    },
                    'error': function(
                        model, // eslint-disable-line no-unused-vars
                        response,
                        options // eslint-disable-line no-unused-vars
                    ) {
                        store.commit('loading', false)
                        reject(response.responseJSON || {
                            'status': 400,
                            'message': 'Error fetching summary CTF data',
                        })
                    },
                })
            })
        },
    },
}
