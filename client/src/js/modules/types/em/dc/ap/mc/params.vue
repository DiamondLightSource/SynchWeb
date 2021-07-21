<template>
  <ul class="clearfix">
    <list-item
      label="Movie Number"
      :item="movieNumber"
    />
    <list-item
      label="First Frame"
      :item="firstFrame"
    />
    <list-item
      label="Last Frame"
      :item="lastFrame"
    />
    <list-item
      label="Dose Per Frame"
      :item="dosePerFrame"
    />
    <list-item
      label="Dose Weight"
      :item="doseWeight"
    />
    <list-item
      label="Total Motion"
      :item="totalMotion"
    />
    <list-item
      label="Average Motion / Frame"
      :item="averageMotionPerFrame"
    />
    <list-item
      label="Patches Used"
      :item="patchesUsed"
    />
    <!-- TODO: make comments work -->
    <li
      class="comment"
      title="Click to edit the comment for motion correction"
    >
      Comment:
      <span class="COMMENTS">{{ motionCorrection.COMMENTS }}</span>
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
    },
}
</script>
