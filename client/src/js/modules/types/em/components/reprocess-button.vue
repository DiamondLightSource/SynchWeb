<template>
  <toolbar-button
    icon="fa fa-cog"
    button-text="Relion Processing"
    :show-text="showText"
    :hint="hint"
    :disabled="hint != 'Run Relion processing'"
    @click="click"
  />
</template>

<script>
import { mapGetters } from 'vuex'
import ToolbarButton from 'modules/types/em/components/toolbar-button.vue'

export default {
    'name': 'ReprocessesButton',
    'components': {
        'toolbar-button': ToolbarButton,
    },
    'props': {
        'showText': {
            'type': Boolean,
            'default': false,
        }
    },
    'computed': {
        ...mapGetters('em', [
            'processingAllowed',
            'processingDisallowedReason',
        ]),
        'hint': function () {
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
