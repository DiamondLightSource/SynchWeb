<template>
  <processing-section
    section-title="Processing Parameters"
    :data-available="dataAvailable"
    not-available-message="No processing parameters available"
    default-hidden
  >
    <parameter-list width="100%">
      <template v-for="(value, name) in parameters">
        <parameter-list-item
          v-if="value.length < 20"
          :key="name"
          width="20%"
          :label="schema[name].label"
          :item="value"
        />
      </template>

      <template v-for="(value, name) in parameters">
        <parameter-list-item
          v-if="value.length >= 20"
          :key="name"
          width="100%"
          :label="schema[name].label"
          :item="value"
        />
      </template>
    </parameter-list>
  </processing-section>
</template>

<script>
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'
import Schema from 'modules/types/em/relion/schema'

export default {
    'name': 'JobParameters',
    'components': {
        'processing-section': ProcessingSection,
        'parameter-list': ParameterList,
        'parameter-list-item': ParameterListItem,
    },
    'mixins': [Schema],
    'props': {
        'processingJobId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'parameters': {},
        }
    },
    'computed': {
        'dataAvailable': function() {
            return Object.keys(this.parameters).length > 0 &&
                Object.keys(this.schema).length > 0
        },
    },
    'mounted': function() {
        this.fetchSchema()
        this.$store.dispatch('em/fetch', {
            'url': 'relion/parameters?processingJobId=' +
                this.processingJobId,
            'humanName': 'Processing Job Parameters',
        }).then(
            (response) => { this.parameters = response }
        )
    },
}
</script>
