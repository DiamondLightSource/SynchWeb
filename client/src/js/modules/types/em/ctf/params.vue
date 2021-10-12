<template>
  <parameter-list>
    <parameter-list-item
      label="Movie Number"
      :value="ctfEstimation.movieNumber"
    />
    <parameter-list-item
      label="Movie Time Stamp"
      :value="ctfEstimation.createdTimeStamp"
    />
    <parameter-list-item
      label="Box size"
      :value="ctfEstimation.boxSizeX"
      :value2="ctfEstimation.boxSizeY"
      unit="μm"
      separator="x"
    />
    <parameter-list-item
      label="Resolution"
      :value="ctfEstimation.minResolution"
      :value2="ctfEstimation.maxResolution"
      unit="Å"
      separator="-"
    />
    <parameter-list-item
      label="Defocus"
      :value="ctfEstimation.minDefocus"
      :value2="ctfEstimation.maxDefocus"
      unit="Å"
      separator="-"
    />
    <parameter-list-item
      label="Defocus Step Size"
      :value="ctfEstimation.defocusStepSize"
      unit="Å"
    />
    <parameter-list-item
      label="Astigmatism"
      :value="ctfEstimation.astigmatism"
      unit="Å"
    />
    <parameter-list-item
      label="Astigmatism Angle"
      :value="ctfEstimation.astigmatismAngle"
      unit="°"
    />
    <parameter-list-item
      label="Estimated Resolution"
      :value="ctfEstimation.estimatedResolution"
      unit="Å"
    />
    <parameter-list-item
      label="Estimated Defocus"
      :value="ctfEstimation.estimatedDefocus"
      unit="Å"
    />
    <parameter-list-item
      label="Amplitude Contrast"
      :value="ctfEstimation.amplitudeContrast"
    />
    <parameter-list-item
      label="CC Value"
      :value="ctfEstimation.ccValue"
    />
    <parameter-list-item
      width="100%"
      label="Comments"
      :value="ctfEstimation.comments"
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
        'ctfEstimation': {
            'type': Object,
            'required': true,
        },
    },
}
</script>
