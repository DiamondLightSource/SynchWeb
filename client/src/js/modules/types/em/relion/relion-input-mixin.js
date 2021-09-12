export default {
    'props': {
        'parameters': {
            'type': Object,
            'required': true,
        },
        'schema': {
            'type': Object,
            'required': true,
        },
        'name': {
            'type': String,
            'required': true,
        },
        'helpText': {
            'type': Array,
            'default': function() { return [] },
        },
    },
    'computed': {
        'extraDescription': function() {
            const extraDescription = this.schema[this.name].extraDescription
            return typeof extraDescription == 'undefined' ?
                this.helpText : extraDescription.concat(this.helpText)
        },
        'value': {
            'get': function() {
                return this.parameters[this.name]
            },
            'set': function(newValue) {
                this.$emit('update', { 'name': this.name, 'value': newValue })
            }
        },
        'label': function() {
            return this.schema[this.name].label
        }
    },
}
