<template>
  <toolbar-button
    hint="Permalink"
    icon="fa fa-link"
    button-text="Permalink"
    @click="click"
  />
</template>

<script>
import ToolbarButton from 'modules/types/em/components/toolbar-button.vue'

export default {
    'name': 'DcToolbar',
    'components': {
        'toolbar-button': ToolbarButton,
    },
    'props': {
        'dataCollectionModel': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'linkUrl' : function() {
            return this.$store.state.appUrl +
                '/dc/visit/' + this.$store.state.proposal.visit +
                '/collection/' + this.dataCollectionModel.get('ID')
        },
    },
    'methods': {
        'click': function() {
            const vm = this
            // This URL format is unique to EM
            // If using the toolbar in a different "type",
            // adjustment will be needed
            navigator.clipboard.writeText(this.linkUrl).then(
                function() {
                    vm.$store.commit('notifications/addNotification', {
                        'title': 'Copied',
                        'message': 'Data collection link URL copied to clipboard',
                        'level': 'info'
                    })
                },
                function() {
                    vm.$store.commit('notifications/addNotification', {
                        'title': 'Not copied',
                        'message': 'link not copied to clipboard - do you need to grant permissions?',
                        'level': 'error'
                    })
                }
            );
        },
    },
}
</script>
