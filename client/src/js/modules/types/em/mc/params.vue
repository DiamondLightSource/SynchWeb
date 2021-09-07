<template>
  <parameter-list>
    <parameter-list-item
      label="Movie Number"
      :item="movieNumber"
    />
    <parameter-list-item
      label="First Frame"
      :item="firstFrame"
    />
    <parameter-list-item
      label="Last Frame"
      :item="lastFrame"
    />
    <parameter-list-item
      label="Dose Per Frame"
      :item="dosePerFrame"
    />
    <parameter-list-item
      label="Dose Weight"
      :item="doseWeight"
    />
    <parameter-list-item
      label="Total Motion"
      :item="totalMotion"
    />
    <parameter-list-item
      label="Average Motion / Frame"
      :item="averageMotionPerFrame"
    />
    <parameter-list-item
      label="Patches Used"
      :item="patchesUsed"
    />
    <parameter-list-item
      width="100%"
      label="Comments"
      :item="comments"
    />
  </parameter-list>
</template>

<script>
import parameterFormats from 'modules/types/em/components/parameter-formats'
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'
import unitsHtml from 'modules/types/em/components/units-html.js'

export default {
    'name': "Params",
    'components': {
        'parameter-list-item': ParameterListItem,
        'parameter-list': ParameterList,
    },
    'mixins': [parameterFormats],
    'props': {
        'motionCorrection': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'movieNumber': function() {
            return this.datumOrBlank(this.motionCorrection.movieNumber)
        },
        'firstFrame': function() {
            return this.datumOrBlank(this.motionCorrection.firstFrame)
        },
        'lastFrame': function() {
            return this.datumOrBlank(this.motionCorrection.lastFrame)
        },
        'dosePerFrame': function() {
            return this.datumWithUnit(
                this.motionCorrection.dosePerFrame,
                unitsHtml.electron + '/' + unitsHtml.angstromSquared
            )
        },
        'doseWeight': function() {
            return this.datumWithUnit(
                this.motionCorrection.doseWeight, '?'
            )
        },
        'totalMotion': function() {
            return this.datumWithUnit(
                this.motionCorrection.totalMotion, 'Å'
            )
        },
        'averageMotionPerFrame': function() {
            return this.datumWithUnit(
                this.motionCorrection.averageMotionPerFrame, 'Å'
            )
        },
        'patchesUsed': function() {
            return this.dimensions(
                this.motionCorrection.patchesUsedX,
                this.motionCorrection.patchesUsedY
            )
        },
        'comments': function() {
            return this.datumOrBlank(this.motionCorrection.comments)
        },
    },
}
</script>
