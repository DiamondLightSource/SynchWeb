<template>
  <toolbar-button
    icon="fa fa-cog"
    button-text="Relion Processing"
    :show-text="showText"
    :hint="hint"
    :disabled="processingDisallowed || waiting"
    @click="click"
  />
</template>

<script>
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
        },
        // see modules/types/em/store/processing-module.js for details
        'defaultParameters': {
            'type': Object,
            'default': null,
        },
        'processingDisallowedReason': {
            'type': String,
            'default': '',
        }
    },
    'data': function() {
        return {
            'waiting': false,
        }
    },
    'computed': {
        'processingDisallowed': function() {
            return this.processingDisallowedReason != ''
        },
        'hint': function() {
            return this.processingDisallowed ?
                this.processingDisallowedReason : 'Run Relion processing'
        },
    },
    'mounted': function() {
        /* Deal with occasional race-condition where we end up with no
           defaultParameters */
        this.$watch(
            function() {
                return {
                    'params': this.defaultParameters,
                    'waiting': this.waiting,
                }
            },
            function(newVal) {
                if (Object.keys(newVal.params).length > 0 && newVal.waiting) {
                    this.showDialog(newVal.params)
                }
            }
        )
    },
    'methods': {
        'showDialog': function() {
            this.waiting = false
            this.$store.commit(
                'em/processing/showDialog',
                this.defaultParameters
            )
        },
        'click': function() {
            /*  If defaultParameters is null:
                    this button isn't attached to a previous job
                    and has no parameters to use/fetch
                If it's an object, but empty:
                    we can use them but they haven't been fetched yet
            */
            if (
                this.defaultParameters === null ||
                Object.keys(this.defaultParameters).length > 0
            ) {
                this.showDialog(this.defaultParameters)
                return
            }

            this.waiting = true
            this.$emit('fetch')
        },
    },
}
</script>
