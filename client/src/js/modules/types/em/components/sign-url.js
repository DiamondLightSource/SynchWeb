import Backbone from 'backbone'

export default {
    'methods': {
        'signUrl': function(url, callback) {
            const apiUrl = this.$store.state.apiUrl
            Backbone.ajax({
                'url': apiUrl + '/download/sign',
                'method': 'POST',
                /* This seems to be broken in `client/src/js/utils.js`
                 * It doesn't post in JSON and `api/src/Page/Download.php`
                 * doesn't see any of the args */
                'contentType': 'application/json',
                'data': JSON.stringify({
                    'validity': url.replace(apiUrl, '')
                }),
                'success': function(response) {
                    callback(url + '&token=' + response.token)
                }
            })
        },
    },
}
