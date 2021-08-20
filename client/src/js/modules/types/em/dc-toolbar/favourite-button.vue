<template>
  <button-with-function
    hint="Click to add this data collection to the list of favourite data collections"
    icon-class="fa fa-star-o"
    button-text="Favourite"
    :level="buttonLevel"
    @click="dataCollectionModel.flag()"
  />
</template>

<script>
import ButtonWithFunction from 'modules/types/em/dc-toolbar/button-with-function.vue'

export default {
    'name': 'FavouriteButton',
    'components': {
        'button-with-function': ButtonWithFunction,
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
