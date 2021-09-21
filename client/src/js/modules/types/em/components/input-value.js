export default {
    'props': {
        'parameters': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'value': {
            'get': function() {
                return this.parameters[this.name]
            },
            'set': function(newValue) {
                this.$emit('update', { 'name': this.name, 'value': newValue })
            }
        },
    },
}
