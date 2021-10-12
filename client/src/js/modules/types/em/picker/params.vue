<template>
  <parameter-list>
    <parameter-list-item
      label="Movie Number"
      :value="pick.movieNumber"
    />
    <parameter-list-item
      label="Movie Time Stamp"
      :value="pick.createdTimeStamp"
    />
    <parameter-list-item
      label="Number of Particles"
      :value="pick.numberOfParticles"
    />
    <parameter-list-item
      label="Particle Diameter"
      :value="pick.particleDiameter"
      unit="nm"
    />
  </parameter-list>
</template>

<script>
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'
import ParameterList from 'modules/types/em/components/parameter-list.vue'

export default {
    'name': "Params",
    'components': {
        'parameter-list-item': ParameterListItem,
        'parameter-list': ParameterList,
    },
    'props': {
        'pick': {
            'type': Object,
            'required': true,
        },
    },
}
</script>
