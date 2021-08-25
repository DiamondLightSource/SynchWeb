<template>
  <parameter-list>
    <parameter-list-item
      label="Movie Number"
      :item="movieNumber"
    />
    <parameter-list-item
      label="Box size"
      :item="boxSize"
    />
    <parameter-list-item
      label="Resolution"
      :item="resolution"
    />
    <parameter-list-item
      label="Defocus"
      :item="defocus"
    />
    <parameter-list-item
      label="Defocus Step Size"
      :item="defocusStepSize"
    />
    <parameter-list-item
      label="Astigmatism"
      :item="astigmatism"
    />
    <parameter-list-item
      label="Astigmatism Angle"
      :item="astigmatismAngle"
    />
    <parameter-list-item
      label="Estimated Resolution"
      :item="estimatedResolution"
    />
    <parameter-list-item
      label="Estimated Defocus"
      :item="estimatedDefocus"
    />
    <parameter-list-item
      label="Estimated Defocus"
      :item="amplitudeContrast"
    />
    <parameter-list-item
      label="CC Value"
      :item="ccValue"
    />
    <parameter-list-item
      width="100%"
      help-text="Click to edit the comment for CTF Estimation"
      label="Comments"
      :item="comments"
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
        'ctfEstimation': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'movieNumber': function() {
            return this.datumOrBlank(this.ctfEstimation.IMAGENUMBER)
        },
        'boxSize': function() {
            return this.dimensions(
                this.datumWithUnit(this.ctfEstimation.BOXSIZEX, '&micro;m'),
                this.datumWithUnit(this.ctfEstimation.BOXSIZEY, '&micro;m')
            )
        },
        'resolution': function() {
            return this.range(
                this.datumWithUnit(this.ctfEstimation.MINRESOLUTION, 'Å'),
                this.datumWithUnit(this.ctfEstimation.MAXRESOLUTION, 'Å')
            )
        },
        'defocus': function() {
            return this.range(
                this.datumWithUnit(this.ctfEstimation.MINDEFOCUS, 'Å'),
                this.datumWithUnit(this.ctfEstimation.MAXDEFOCUS, 'Å')
            )
        },
        'defocusStepSize': function() {
            return this.datumWithUnit(this.ctfEstimation.DEFOCUSSTEPSIZE, 'Å')
        },
        'astigmatism': function() {
            return this.datumWithUnit(this.ctfEstimation.ASTIGMATISM, 'Å')
        },
        'astigmatismAngle': function() {
            return this.datumWithUnit(this.ctfEstimation.ASTIGMATISMANGLE, '&deg;')
        },
        'estimatedResolution': function() {
            return this.datumWithUnit(this.ctfEstimation.ESTIMATEDRESOLUTION, 'Å')
        },
        'estimatedDefocus': function() {
            return this.datumWithUnit(this.ctfEstimation.ESTIMATEDDEFOCUS, 'Å')
        },
        'amplitudeContrast': function() {
            return this.datumOrBlank(this.ctfEstimation.AMPLITUDECONTRAST)
        },
        'ccValue': function() {
            return this.datumOrBlank(this.ctfEstimation.CCVALUE)
        },
        'comments': function() {
            return this.datumOrBlank(this.ctfEstimation.COMMENTS)
        },
    },
}
</script>
