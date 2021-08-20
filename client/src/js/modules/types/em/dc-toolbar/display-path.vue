<template>
  <span>
    <flat-button @click="displayFullPath = !displayFullPath">
      <i :class="expandClass" />
    </flat-button>
    <span class="temp">{{ displayPath }}</span>
  </span>
</template>

<script>
import FlatButton from 'app/components/flat-button.vue'

export default {
    'name': 'DisplayPath',
    'components': {
        'flat-button': FlatButton,
    },
    'props': {
        'dataCollectionModel': {
            'type': Object,
            'required': true,
        },
    },
    'data': function() {
        return {
            'displayFullPath': false,
        }
    },
    'computed': {
        'displayPath': function() {
            return this.dataCollectionModel.get(
                this.displayFullPath ? 'DIRFULL' : 'DIR'
            ) + this.dataCollectionModel.get('FILETEMPLATE')
        },
        'expandClass': function() {
            return 'fa fa-caret-' + (this.displayFullPath ? 'left' : 'right')
        },
    },
}
</script>
