<template>
  <parameter-list
    v-if="Object.keys(schema).length > 0"
    width="100%"
  >
    <template v-for="(rules, name) in schema">
      <parameter-list-item
        v-if="hasData(name) && !isLong(name)"
        :key="name"
        width="20%"
        :label="rules.label"
        :value="value(name)"
        :unit="rules.unit"
      />
    </template>

    <template v-for="(rules, name) in schema">
      <parameter-list-item
        v-if="hasData(name) && isLong(name)"
        :key="name"
        width="100%"
        :label="rules.label"
        :value="value(name)"
        :unit="rules.unit"
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
    'mounted': function() {
        this.$store.dispatch('em/fetch', {
            'url': this.schemaUrl,
            'humanName': this.schemaName,
        }).then(
            (response) => {
                this.schema = response
            }
        )
    },
    'methods': {
        'hasData': function(name) {
            const value = this.parameters[name]
            return typeof value != 'undefined'
        },
        'isLong': function(name) {
            return name == 'comments' ||
                this.parameters[name].length >= 20
        },
        'value': function(name) {
            const value = this.parameters[name]
            if (this.schema[name].type == 'boolean') {
                return ['1', 'true'].includes(value.toLowerCase()) ?
                    'yes' : 'no'
            }
            return value
        },
    },
}
</script>
