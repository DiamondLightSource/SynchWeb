<template>
  <processing-section
    :section-title="sectionTitle"
    :data-available="dataAvailable"
    default-hidden
  >
    <parameter-list width="100%">
      <template v-for="(value, name) in parameters">
        <parameter-list-item
          v-if="value.length < 20"
          :key="name"
          width="20%"
          :label="schema[name].label"
          :value="value"
          :unit="schema[name].unit"
        />
      </template>

      <template v-for="(value, name) in parameters">
        <parameter-list-item
          v-if="value.length >= 20"
          :key="name"
          width="100%"
          :label="schema[name].label"
          :value="value"
          :unit="schema[name].unit"
        />
      </template>
    </parameter-list>
  </processing-section>
</template>

<script>
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': 'ProcessingSectionWithSchema',
    'components': {
        'processing-section': ProcessingSection,
        'parameter-list': ParameterList,
        'parameter-list-item': ParameterListItem,
    },
    'props': {
        'sectionTitle': {
            'type': String,
            'required': true,
        },
        'defaultHidden': {
            'type': Boolean,
            'default': false,
        },
        'schemaName': {
            'type': String,
            'required': true,
        },
        'schemaUrl': {
            'type': String,
            'required': true,
        },
        'dataUrl': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'parameters': {},
            'schema': {},
        }
    },
    'computed': {
        'dataAvailable': function() {
            return Object.keys(this.parameters).length > 0 &&
                Object.keys(this.schema).length > 0
        },
    },
    'mounted': function() {
        this.$store.dispatch('em/fetch', {
            'url': this.schemaUrl,
            'humanName': this.schemaName,
        }).then(
            (response) => { this.schema = response }
        )
        this.$store.dispatch('em/fetch', {
            'url': this.dataUrl,
            'humanName': this.sectionTitle,
        }).then(
            (response) => { this.parameters = response }
        )
    },
}
</script>
