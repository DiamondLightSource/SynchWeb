<template>
  <parameter-list>
    <parameter-list-item
      label="Type"
      :value="particleClass.type"
    />
    <parameter-list-item
      label="Batch Number"
      :value="particleClass.batchNumber"
    />
    <parameter-list-item
      label="Classes Per Batch"
      :value="particleClass.numberOfClassesPerBatch"
    />
    <parameter-list-item
      label="Particles Per Batch"
      :value="particleClass.numberOfParticlesPerBatch"
    />
    <parameter-list-item
      label="Symmetry"
      :value="particleClass.symmetry"
    />
    <parameter-list-item
      label="Class Number"
      :value="particleClass.classNumber"
    />
    <parameter-list-item
      label="Class Distribution"
      :value="particleClass.classDistribution"
    />
    <parameter-list-item
      label="Particles Per Class"
      :value="particleClass.particlesPerClass"
    />
    <parameter-list-item
      label="Rotation Accuracy"
      :value="particleClass.rotationAccuracy"
    />
    <parameter-list-item
      label="Translation Accuracy"
      :value="particleClass.translationAccuracy"
      unit="Å"
    />
    <parameter-list-item
      label="Estimated Resolution"
      :value="particleClass.estimatedResolution"
    />
    <parameter-list-item
      label="Overall Fourier Completeness"
      :value="particleClass.overallFourierCompleteness"
    />
    <parameter-list-item
      label="Resolution"
      :value="particleClass.resolution"
    />
    <parameter-list-item
      label="Number of Particles"
      :value="particleClass.numberOfParticles"
    />
  </parameter-list>
</template>

<script>
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'

export default {
    'name': 'Parameters',
    'components': {
        'parameter-list-item': ParameterListItem,
        'parameter-list': ParameterList,
    },
    'props': {
        'particleClass': {
            'type': Object,
            'required': true,
        },
    },
}
</script>
