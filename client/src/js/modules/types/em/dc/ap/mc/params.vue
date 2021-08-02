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
      help-text="Click to edit the comment for motion correction"
      label="Comments"
      :item="comments"
    />
  </parameter-list>
</template>

<script>
import formatsUnits from 'modules/types/em/components/formats-units'
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'

export default {
    'name': "Params",
    'components': {
        'parameter-list-item': ParameterListItem,
        'parameter-list': ParameterList,
    },
    'mixins': [formatsUnits],
    'props': {
        'motionCorrection': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'movieNumber': function() {
            return this.datumOrBlank(this.motionCorrection.IMAGENUMBER)
        },
        'firstFrame': function() {
            return this.datumOrBlank(this.motionCorrection.FIRSTFRAME)
        },
        'lastFrame': function() {
            return this.datumOrBlank(this.motionCorrection.LASTFRAME)
        },
        'dosePerFrame': function() {
            return this.datumWithUnit(
                this.motionCorrection.DOSEPERFRAME,
                this.electronsPerAngstromSquared
            )
        },
        'doseWeight': function() {
            return this.datumWithUnit(
                this.motionCorrection.DOSEWEIGHT,
                '?'
            )
        },
        'totalMotion': function() {
            return this.datumWithUnit(
                this.motionCorrection.TOTALMOTION,
                this.angstrom
            )
        },
        'averageMotionPerFrame': function() {
            return this.datumWithUnit(
                this.motionCorrection.AVERAGEMOTIONPERFRAME,
                this.angstrom
            )
        },
        'patchesUsed': function() {
            return this.dimensions(
                this.motionCorrection.PATCHESUSEDX,
                this.motionCorrection.PATCHESUSEDY
            )
        },
        'comments': function() {
            return this.datumOrBlank(this.motionCorrection.COMMENTS)
        },
    },
}
</script>
