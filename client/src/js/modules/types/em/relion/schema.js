export default {
    'data': function() {
        return {
            'schema': {},
        }
    },
    'methods': {
        'fetchSchema': function(callback) {
            this.$store.dispatch('em/fetch', {
                'url': '/em/relion/schema/',
                'humanName': 'Relion Schema',
            }).then(
                (response) => {
                    this.schema = response
                    if (typeof callback !== 'undefined') {
                        callback()
                    }
                }
            )
        },
    },
}
