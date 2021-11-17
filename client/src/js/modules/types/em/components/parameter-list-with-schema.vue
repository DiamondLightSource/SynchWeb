<template>
  <parameter-list
    v-if="Object.keys(schema).length > 0"
    width="100%"
  >
    <template v-for="(item, name) in displayParameters.short">
      <parameter-list-item
        :key="name"
        width="20%"
        :label="item.label"
        :value="item.value"
        :unit="item.unit"
      />
    </template>

    <template v-for="(item, name) in displayParameters.long">
      <parameter-list-item
        :key="name"
        width="100%"
        :label="item.label"
        :value="item.value"
        :unit="item.unit"
      />
    </template>
  </parameter-list>

  <div v-else>
    Parameter definitions not loaded
  </div>
</template>

<script>
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'

export default {
    'name': 'ParameterListWithSchema',
    'components': {
        'parameter-list': ParameterList,
        'parameter-list-item': ParameterListItem,
    },
    'props': {
        'schemaName': {
            'type': String,
            'required': true,
        },
        'schemaUrl': {
            'type': String,
            'required': true,
        },
        'parameters': {
            'type': Object,
            'required': true,
        },
    },
    'data': function() {
        return {
            'schema': {},
        }
    },
    'computed': {
        'displayParameters': function() {
            var displayParameters = {
                'long': {},
                'short': {},
            }
            for (const name in this.schema) {
                var value = this.parameters[name]
                if (typeof value == 'undefined') {
                    continue
                }
                const rules = this.schema[name]
                const display = typeof rules.display == 'undefined' ?
                    true : rules.display
                if ((!display) || (display == 'notBlank' && !value)) {
                    continue;
                }
                if (rules.type == 'boolean') {
                    value = ['1', 'true'].includes(
                        value.toString().toLowerCase()
                    ) ? 'yes' : 'no'
                }
                if (typeof rules.displayOptions != 'undefined') {
                    value = rules.displayOptions[
                        rules.options.indexOf(value)
                    ];
                }
                const section = name == 'comments' || value.length >= 20 ?
                    'long' : 'short'
                displayParameters[section][name] = {
                    'label': rules.label,
                    'unit': rules.unit,
                    'value': value,
                }
            }
            return displayParameters
        }
    },
    'mounted': function() {
        this.$store.dispatch('em/api/fetch', {
            'url': this.schemaUrl,
            'humanName': this.schemaName,
        }).then(
            (response) => {
                this.schema = response
            }
        )
    },
}
</script>
