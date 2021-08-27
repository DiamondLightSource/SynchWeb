export default {
    'props': {
        'parameters': {
            'type': Object,
            'required': true,
        },
        'name': {
            'type': String,
            'required': true,
        },
        'extraDescription': {
            'type': Array,
            'default': function() { return [] },
        },
    },
    'computed': {
        'value': {
            'get': function() {
                console.log('get', this.name, this.parameters[this.name].value)
                return this.parameters[this.name].value
            },
            'set': function(newValue) {
                console.log('set', this.name, newValue)
                this.$emit('update', { 'name': this.name, 'value': newValue })
            }
        },
        'label': function() {
            return this.parameters[this.name].label
        }
    },
}
