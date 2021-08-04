<template>
  <custom-list-item
    :help-text="helpText"
    :width="width"
  >
    <strong>{{ label }}:</strong>
    <span v-html="item" />
    <template v-if="label2">
      <strong>{{ label2 }}:</strong>
      <span v-html="item2" />
    </template>
  </custom-list-item>
</template>

<script>
import CustomListItem from 'modules/types/em/components/custom-list-item.vue'

export default {
    'name': 'ParameterListItem',
    'components': {
        'custom-list-item': CustomListItem
    },
    'props': {
        'width': {
            'type': String,
            'default': '50%',
        },
        'label': {
            'type': String,
            'default': '',
        },
        'item': {
            'type': String,
            'required': true,
        },
        'label2': {
            'type': String,
            'default': '',
        },
        'item2': {
            'type': String,
            'default': '',
        },
        'helpText': {
            'type': String,
            'default': '',
        },
    },
}
</script>
