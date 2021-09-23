export default {
    'computed': {
        'value': {
            'get': function() {
                return this.form.fields[this.name]
            },
            'set': function(newValue) {
                this.form.update(this.name, newValue)
            }
        },
    },
}
