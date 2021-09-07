<template>
  <parameter-list>
    <parameter-list-item
      label="Movie Number"
      :item="movieNumber"
    />
    <parameter-list-item
      label="Number of Particles"
      :item="numberOfParticles"
    />
    <parameter-list-item
      label="Particle Diameter"
      :item="particleDiameter"
    />
  </parameter-list>
</template>

<script>
import parameterFormats from 'modules/types/em/components/parameter-formats'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'
import ParameterList from 'modules/types/em/components/parameter-list.vue'

export default {
    'name': "Params",
    'components': {
        'parameter-list-item': ParameterListItem,
        'parameter-list': ParameterList,
    },
    'mixins': [parameterFormats],
    'props': {
        'pick': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'movieNumber': function() {
            return this.datumOrBlank(this.pick.movieNumber)
        },
        'numberOfParticles': function() {
            return this.datumOrBlank(this.pick.numberOfParticles)
        },
        'particleDiameter': function() {
            return this.datumOrBlank(this.pick.particleDiameter)
        },
    },
}
</script>
