<template>
  <toolbar-button
    hint="Click to add this data collection to the list of favourite data collections"
    icon="fa fa-star-o"
    button-text="Favourite"
    :level="buttonLevel"
    @click="dataCollectionModel.flag()"
  />
</template>

<script>
import ToolbarButton from 'modules/types/em/components/toolbar-button.vue'

export default {
    'name': 'FavouriteButton',
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
        'buttonLevel': function() {
            return this.dataCollectionModel.get('COMMENTS').match(/_FLAG_/) === null ?
                'secondary': 'info'
        },
    },
}
</script>
