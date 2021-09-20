export default {
    'props': {
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
        'extraClass': {
            'type': String,
            'default': '',
        },
        'errorMessages': {
            'type': Object,
            'default': function() {
                return {}
            },
        },
    },
}
