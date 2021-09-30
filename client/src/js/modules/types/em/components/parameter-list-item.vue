<template>
  <custom-list-item
    :help-text="helpText"
    :width="width"
  >
    <strong>{{ label }} :</strong>
    {{ valueAndUnit }}
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
        // eslint-disable-next-line vue/require-prop-types
        'value': {
            'required': true,
        },
        // value2 is used when we have an X,Y pair or a range
        // include a separator to separate the 2 values
        // eslint-disable-next-line vue/require-prop-types
        'value2': {
            'default': ''
        },
        'unit': {
            'type': String,
            'default': '',
        },
        'separator': {
            'type': String,
            'default': '',
        },
        'helpText': {
            'type': String,
            'default': '',
        },
    },
    'computed': {
        'valueAndUnit': function() {
            if (!this.value) {
                return ''
            }

            const value1 = this.value.toString().trim() + this.unit
            if (!this.value2) {
                return value1
            }

            const value2 = this.value2.toString().trim() + this.unit
            return value1 + ' ' + this.separator + ' ' + value2
        },
    },
}
</script>
