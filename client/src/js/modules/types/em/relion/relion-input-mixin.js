import { mapGetters } from 'vuex'

export default {
    'props': {
        'name': {
            'type': String,
            'required': true,
        },
        'disabled': {
            'type': Boolean,
            'default': false,
        },
        'label': {
            'type': String,
            'required': true,
        },
        'extraDescription': {
            'type': Array,
            'default': function() { return [] },
        },
    },
    'computed': {
        'errorMessage': function() {
            return this.$store.state.em.relion.formErrors.first(this.name)
        },
        'value': {
            'get': function() {
                return this.$store.state.em.relion.params[this.name]
            },
            'set': function(newValue) {
                this.$store.commit('em/relion/updateParam', {
                    'name': this.name,
                    'value': newValue
                })
            },
        },
    },
}
