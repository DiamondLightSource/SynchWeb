import Backbone from 'backbone'

export default {
    'methods': {
        'signUrl': function(url, callback) {
            const apiUrl = this.$store.state.apiUrl
            Backbone.ajax({
                'url': apiUrl + '/download/sign',
                'method': 'POST',
                'data': { 'validity': url.replace(apiUrl, '') },
                'success': function(response) {
                    callback(url + '&token=' + response.token)
                }
            })
        },
    },
}
