<template>
  <parameter-list width="100%">
    <parameter-list-item
      width="20%"
      label="Voltage"
      :value="voltage"
      unit="kV"
    />
    <parameter-list-item
      width="20%"
      label="C1 Lens"
      :value="dataCollection.C1LENS"
      unit="%"
    />
    <parameter-list-item
      width="20%"
      label="C1 Aperture"
      :value="dataCollection.C1APERTURE"
      unit="μm"
    />
    <parameter-list-item
      width="20%"
      label="C2 Lens"
      :value="dataCollection.C2LENS"
      unit="%"
    />
    <parameter-list-item
      width="20%"
      label="C2 Aperture"
      :value="dataCollection.C2APERTURE"
      unit="μm"
    />
    <parameter-list-item
      width="20%"
      label="C3 Lens"
      :value="dataCollection.C3LENS"
      unit="%"
    />
    <parameter-list-item
      width="20%"
      label="C3 Aperture"
      :value="dataCollection.C3APERTURE"
      unit="μm"
    />
    <parameter-list-item
      width="20%"
      label="Objective Aperture"
      :value="dataCollection.OBJAPERTURE"
      unit="μm"
    />
    <parameter-list-item
      width="20%"
      label="Magnification"
      :value="dataCollection.MAGNIFICATION"
      unit="X"
    />
    <parameter-list-item
      width="20%"
      label="Energy Filter"
      :value="dataCollection.SLITGAPHORIZONTAL"
    />
    <parameter-list-item
      width="20%"
      label="Phase Plate"
      :value="dataCollection.PHASEPLATE == 1"
    />
    <parameter-list-item
      width="20%"
      label="Beam Size"
      :value="dataCollection.BSX"
      :value2="dataCollection.BSY"
      unit="μm"
      separator="x"
    />
    <parameter-list-item
      width="20%"
      label="Detector Manufacturer"
      :value="dataCollection.DETECTORMANUFACTURER"
    />
    <parameter-list-item
      width="20%"
      label="Detector Model"
      :value="dataCollection.DETECTORMODEL"
    />
    <parameter-list-item
      width="20%"
      label="Detector Mode"
      :value="dataCollection.DETECTORMODE"
    />
    <parameter-list-item
      width="20%"
      label="Pixel Size"
      :value="dataCollection.PIXELSIZEONIMAGE"
      unit="Å/pixel"
    />
    <parameter-list-item
      width="20%"
      label="Binning"
      :value="dataCollection.BINNING"
      unit="pixels"
    />
    <parameter-list-item
      width="20%"
      label="Image Size"
      :value="dataCollection.IMAGESIZEX"
      :value2="dataCollection.IMAGESIZEY"
      unit="pixels"
      separator="x"
    />
    <parameter-list-item
      width="20%"
      label="No. Movies"
      :value="dataCollection.NUMIMG"
    />
    <parameter-list-item
      width="20%"
      label="Frames/Movie"
      :value="dataCollection.NUMBEROFPASSES"
    />
    <parameter-list-item
      width="20%"
      label="Frame Length"
      :value="frameLength"
      unit="s"
    />
    <parameter-list-item
      width="20%"
      label="Total Dose"
      :value="dataCollection.TOTALDOSE"
      unit="e⁻/Å²"
    />
    <parameter-list-item
      v-if="isStopped"
      width="20%"
      label="State"
      value="Stopped"
    />
    <parameter-list-item
      width="100%"
      label="Comment"
      :value="dataCollection.COMMENTS"
    />
  </parameter-list>
</template>

<script>
import KvLambda from 'modules/types/em/components/kv-lambda'
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'

export default {
    'name': 'DataCollectionHeader',
    'components': {
        'parameter-list': ParameterList,
        'parameter-list-item': ParameterListItem,
    },
    'props': {
        'dataCollection': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'voltage': function() {
            const voltage = KvLambda().l2kV(this.dataCollection.WAVELENGTH)
            return voltage == Infinity ? '∞' : voltage
        },
        'frameLength': function() {
            return parseFloat(this.dataCollection.EXPOSURETIME) /
                parseInt(this.dataCollection.NUMBEROFPASSES, 10)
        },
        'isStopped': function() {
            return this.dataCollection.STATE == false
        },
    },
}
</script>
