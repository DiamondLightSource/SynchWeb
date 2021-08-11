<template>
  <button-with-function
    hint="Click to add this data collection to the list of favourite data collections"
    icon-class="fa fa-star-o"
    button-text="Favourite"
    :highlight="flagHighlight"
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
    'data': function() {
        return {
            'flagHighlight': false,
        }
    },
    'mounted': function() {
        const vm = this
        vm.checkComment(vm.dataCollectionModel)
        vm.dataCollectionModel.on('sync', function() {
            vm.checkComment(this)
        });
    },
    'methods': {
        'checkComment': function(model) {
            this.flagHighlight = model.get('COMMENTS').match(/_FLAG_/) !== null
        }
    }
}
</script>
