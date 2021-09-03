<template>
  <parameter-list>
    <parameter-list-item
      label="Batch Number"
      :item="batchNumber"
    />
    <parameter-list-item
      label="Class Number"
      :item="classNumber"
    />
    <parameter-list-item
      label="Estimated Resolution"
      :item="estimatedResolution"
    />
    <parameter-list-item
      label="First Motion Correction Id"
      :item="firstMotionCorrectionId"
    />
    <parameter-list-item
      label="Number Of Classes Per Batch"
      :item="numberOfClassesPerBatch"
    />
    <parameter-list-item
      label="Number Of Particles"
      :item="numberOfParticles"
    />
    <parameter-list-item
      label="Number Of Particles Per Batch"
      :item="numberOfParticlesPerBatch"
    />
    <parameter-list-item
      label="Overall Fourier Completeness"
      :item="overallFourierCompleteness"
    />
    <parameter-list-item
      label="Particle Classification Id"
      :item="particleClassificationId"
    />
    <parameter-list-item
      label="Particle Diameter"
      :item="particleDiameter"
    />
    <parameter-list-item
      label="Particles Per Class"
      :item="particlesPerClass"
    />
    <parameter-list-item
      label="Resolution"
      :item="resolution"
    />
    <parameter-list-item
      label="Rotation Accuracy"
      :item="rotationAccuracy"
    />
    <parameter-list-item
      label="Symmetry"
      :item="symmetry"
    />
    <parameter-list-item
      label="Translation Accuracy"
      :item="translationAccuracy"
    />
    <parameter-list-item
      label="Type"
      :item="type"
    />
  </parameter-list>
</template>

<script>
import parameterFormats from 'modules/types/em/components/parameter-formats'
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'
import unitsHtml from 'modules/types/em/components/units-html.js'

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
        'batchNumber': function() {
            return this.datumOrBlank(this.particleClass.batchNumber)
        },
        'classNumber': function() {
            return this.datumOrBlank(this.particleClass.classNumber)
        },
        'estimatedResolution': function() {
            return this.datumOrBlank(this.particleClass.estimatedResolution)
        },
        'firstMotionCorrectionId': function() {
            return this.datumOrBlank(this.particleClass.firstMotionCorrectionId)
        },
        'numberOfClassesPerBatch': function() {
            return this.datumOrBlank(this.particleClass.numberOfClassesPerBatch)
        },
        'numberOfParticles': function() {
            return this.datumOrBlank(this.particleClass.numberOfParticles)
        },
        'numberOfParticlesPerBatch': function() {
            return this.datumOrBlank(this.particleClass.numberOfParticlesPerBatch)
        },
        'overallFourierCompleteness': function() {
            return this.datumOrBlank(this.particleClass.overallFourierCompleteness)
        },
        'particleClassificationId': function() {
            return this.datumOrBlank(this.particleClass.particleClassificationId)
        },
        'particleDiameter': function() {
            return this.datumOrBlank(this.particleClass.particleDiameter)
        },
        'particlesPerClass': function() {
            return this.datumOrBlank(this.particleClass.particlesPerClass)
        },
        'resolution': function() {
            return this.datumOrBlank(this.particleClass.resolution)
        },
        'rotationAccuracy': function() {
            return this.datumOrBlank(this.particleClass.rotationAccuracy)
        },
        'symmetry': function() {
            return this.datumOrBlank(this.particleClass.symmetry)
        },
        'translationAccuracy': function() {
            return this.datumOrBlank(this.particleClass.translationAccuracy)
        },
        'type': function() {
            return this.datumOrBlank(this.particleClass.type)
        },
    },
}
</script>
