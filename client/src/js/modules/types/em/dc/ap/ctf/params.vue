<template>
  <ul class="clearfix">
    <list-item
      label="Movie Number"
      :item="movieNumber"
    />
    <list-item
      label="Box size"
      :item="boxSize"
    />
    <list-item
      label="Resolution"
      :item="resolution"
    />
    <list-item
      label="Defocus"
      :item="defocus"
    />
    <list-item
      label="Defocus Step Size"
      :item="defocusStepSize"
    />
    <list-item
      label="Astigmatism"
      :item="astigmatism"
    />
    <list-item
      label="Astigmatism Angle"
      :item="astigmatismAngle"
    />
    <list-item
      label="Estimated Resolution"
      :item="estimatedResolution"
    />
    <list-item
      label="Estimated Defocus"
      :item="estimatedDefocus"
    />
    <list-item
      label="Estimated Defocus"
      :item="amplitudeContrast"
    />
    <list-item
      label="CC Value"
      :item="ccValue"
    />
    <!-- TODO: make comments work -->
    <li
      class="comment"
      title="Click to edit the comment for CTF estimation"
    >
      Comment:
      <span class="COMMENTS">{{ ctfEstimation.COMMENTS }}</span>
    </li>
  </ul>
</template>

<script>
import formatsUnits from 'modules/types/em/components/formats-units'
import ListItem from 'modules/types/em/components/list-item.vue'

export default {
    'name': "Params",
    'components': {
        'list-item': ListItem,
    },
    'mixins': [formatsUnits],
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
                this.datumWithUnit(this.ctfEstimation.MINRESOLUTION, this.angstrom),
                this.datumWithUnit(this.ctfEstimation.MAXRESOLUTION, this.angstrom)
            )
        },
        'defocus': function() {
            return this.range(
                this.datumWithUnit(this.ctfEstimation.MINDEFOCUS, this.angstrom),
                this.datumWithUnit(this.ctfEstimation.MAXDEFOCUS, this.angstrom)
            )
        },
        'defocusStepSize': function() {
            return this.datumWithUnit(this.ctfEstimation.DEFOCUSSTEPSIZE, this.angstrom)
        },
        'astigmatism': function() {
            return this.datumWithUnit(this.ctfEstimation.ASTIGMATISM, this.angstrom)
        },
        'astigmatismAngle': function() {
            return this.datumWithUnit(this.ctfEstimation.ASTIGMATISMANGLE, '&deg;')
        },
        'estimatedResolution': function() {
            return this.datumWithUnit(this.ctfEstimation.ESTIMATEDRESOLUTION, this.angstrom)
        },
        'estimatedDefocus': function() {
            return this.datumWithUnit(this.ctfEstimation.ESTIMATEDDEFOCUS, this.angstrom)
        },
        'amplitudeContrast': function() {
            return this.datumOrBlank(this.ctfEstimation.AMPLITUDECONTRAST)
        },
        'ccValue': function() {
            return this.datumOrBlank(this.ctfEstimation.CCVALUE)
        },
    },
}
</script>
