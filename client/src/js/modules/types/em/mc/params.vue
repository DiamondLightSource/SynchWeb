<template>
  <parameter-list>
    <parameter-list-item
      label="Movie Number"
      :value="motionCorrection.movieNumber"
    />
    <parameter-list-item
      label="Movie Time Stamp"
      :value="motionCorrection.createdTimeStamp"
    />
    <parameter-list-item
      label="First Frame"
      :value="motionCorrection.firstFrame"
    />
    <parameter-list-item
      label="Last Frame"
      :value="motionCorrection.lastFrame"
    />
    <parameter-list-item
      label="Dose Per Frame"
      :value="motionCorrection.dosePerFrame"
      unit="e⁻/Å²"
    />
    <parameter-list-item
      label="Dose Weight"
      :value="motionCorrection.doseWeight"
      unit="?"
    />
    <parameter-list-item
      label="Total Motion"
      :value="motionCorrection.totalMotion"
      unit="Å"
    />
    <parameter-list-item
      label="Average Motion / Frame"
      :value="motionCorrection.averageMotionPerFrame"
      unit="Å"
    />
    <parameter-list-item
      label="Patches Used"
      :value="motionCorrection.patchesUsedX"
      :value2="motionCorrection.patchesUsedY"
      separator="X"
    />
    <parameter-list-item
      width="100%"
      label="Comments"
      :value="motionCorrection.comments"
    />
  </parameter-list>
</template>

<script>
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'

export default {
    'name': "Params",
    'components': {
        'parameter-list-item': ParameterListItem,
        'parameter-list': ParameterList,
    },
    'props': {
        'motionCorrection': {
            'type': Object,
            'required': true,
        },
    },
}
</script>
