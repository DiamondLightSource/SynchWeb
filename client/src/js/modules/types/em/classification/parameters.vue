<template>
  <parameter-list>
    <parameter-list-item
      label="Type"
      :item="type"
    />
    <parameter-list-item
      label="Batch Number"
      :item="batchNumber"
    />
    <parameter-list-item
      label="Classes Per Batch"
      :item="numberOfClassesPerBatch"
    />
    <parameter-list-item
      label="Particles Per Batch"
      :item="numberOfParticlesPerBatch"
    />
    <parameter-list-item
      label="Symmetry"
      :item="symmetry"
    />
    <parameter-list-item
      label="Class Number"
      :item="classNumber"
    />
    <parameter-list-item
      label="Class Distribution"
      :item="classDistribution"
    />
    <parameter-list-item
      label="Particles Per Class"
      :item="particlesPerClass"
    />
    <parameter-list-item
      label="Rotation Accuracy"
      :item="rotationAccuracy"
    />
    <parameter-list-item
      label="Translation Accuracy"
      :item="translationAccuracy"
    />
    <parameter-list-item
      label="Estimated Resolution"
      :item="estimatedResolution"
    />
    <parameter-list-item
      label="Overall Fourier Completeness"
      :item="overallFourierCompleteness"
    />
    <parameter-list-item
      label="Resolution"
      :item="resolution"
    />
    <parameter-list-item
      label="Number of Particles"
      :item="numberOfParticles"
    />
  </parameter-list>
</template>

<script>
import parameterFormats from 'modules/types/em/components/parameter-formats'
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'

export default {
    'name': 'Parameters',
    'components': {
        'parameter-list-item': ParameterListItem,
        'parameter-list': ParameterList,
    },
    'mixins': [parameterFormats],
    'props': {
        'particleClass': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'type': function() {
            return this.datumOrBlank(this.particleClass.type)
        },
        'batchNumber': function() {
            return this.datumOrBlank(this.particleClass.batchNumber)
        },
        'numberOfParticlesPerBatch': function() {
            return this.datumOrBlank(this.particleClass.numberOfParticlesPerBatch)
        },
        'numberOfClassesPerBatch': function() {
            return this.datumOrBlank(this.particleClass.numberOfClassesPerBatch)
        },
        'symmetry': function() {
            return this.datumOrBlank(this.particleClass.symmetry)
        },
        'classNumber': function() {
            return this.datumOrBlank(this.particleClass.classNumber)
        },
        'classDistribution': function() {
            return this.datumOrBlank(this.particleClass.classDistribution)
        },
        'particlesPerClass': function() {
            return this.datumOrBlank(this.particleClass.particlesPerClass)
        },
        'rotationAccuracy': function() {
            return this.datumOrBlank(this.particleClass.rotationAccuracy)
        },
        'translationAccuracy': function() {
            return this.datumWithUnit(
                this.particleClass.translationAccuracy,
                'Å'
            )
        },
        'estimatedResolution': function() {
            return this.datumOrBlank(this.particleClass.estimatedResolution)
        },
        'overallFourierCompleteness': function() {
            return this.datumOrBlank(this.particleClass.overallFourierCompleteness)
        },
        'resolution': function() {
            return this.datumOrBlank(this.particleClass.resolution)
        },
        'numberOfParticles': function() {
            return this.datumOrBlank(this.particleClass.numberOfParticles)
        },
    },
}
</script>
