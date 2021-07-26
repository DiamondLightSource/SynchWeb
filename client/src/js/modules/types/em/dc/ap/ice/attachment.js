/**
 * Mixin for Vue components to attachment property and property checkers
 */
export default {
    'props': {
        'attachment': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'isJson': function() {
            return this.attachment.FILE.split('.').pop() == 'json'
        },
    },
}