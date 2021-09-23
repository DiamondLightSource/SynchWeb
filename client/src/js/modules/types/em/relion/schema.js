export default {
    'data': function() {
        return {
            'schema': {},
        }
    },
    'methods': {
        'fetchSchema': function(callback) {
            this.$store.dispatch('em/fetch', {
                'url': 'relion/schema/',
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
        'iterateSchema': function(callback) {
            Object.keys(this.schema).forEach(callback)
        },
    },
}
