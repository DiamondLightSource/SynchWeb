<template>
  <flat-button
    class="blue"
    :title="hintText"
    :disabled="hintText != 'Run Relion processing'"
    @click="click"
  >
    <i class="fa fa-cog" />
  </flat-button>
</template>

<script>
import { mapGetters } from 'vuex'
import FlatButton from 'app/components/flat-button.vue'

export default {
    'name': 'ReprocessesButton',
    'components': {
        'flat-button': FlatButton,
    },
    'computed': {
        ...mapGetters('em', [
            'processingAllowed',
            'processingDisallowedReason',
        ]),
        'hintText': function () {
            return this.processingAllowed ?
                'Run Relion processing' :
                this.processingDisallowedReason
        }
    },
    'methods': {
        'click': function() {
            this.$store.commit('em/showProcessingDialog', true)
        }
    },
}
</script>
