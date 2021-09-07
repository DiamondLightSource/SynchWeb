<template>
  <parameter-list width="100%">
    <parameter-list-item
      width="20%"
      label="Voltage"
      :item="voltage"
    />
    <parameter-list-item
      width="20%"
      label="C1 Lens"
      :item="c1Lens"
      label2="Aperture"
      :item2="c1Aperture"
    />
    <parameter-list-item
      width="20%"
      label="C2 Lens"
      :item="c2Lens"
      label2="Aperture"
      :item2="c2Aperture"
    />
    <parameter-list-item
      width="20%"
      label="C3 Lens"
      :item="c3Lens"
      label2="Aperture"
      :item2="c3Aperture"
    />
    <parameter-list-item
      width="20%"
      label="Obj Aperture"
      :item="objAperture"
    />
    <parameter-list-item
      width="20%"
      label="Magnification"
      :item="magnification"
    />
    <parameter-list-item
      width="20%"
      label="Magnification"
      :item="magnification"
    />
    <parameter-list-item
      v-if="hasEnergyFilter"
      width="20%"
      label="Energy Filter"
      :item="energyFilter"
    />
    <parameter-list-item
      width="20%"
      label="Phase Plate"
      :item="phasePlate"
    />
    <parameter-list-item
      width="20%"
      label="Beam Size"
      :item="beamSize"
    />
    <parameter-list-item
      width="20%"
      label="Detector"
      :item="detector"
    />
    <parameter-list-item
      width="20%"
      label="Detector Mode"
      :item="detectorMode"
    />
    <parameter-list-item
      width="20%"
      label="Sample Pixel Size"
      :item="samplePixelSize"
    />
    <parameter-list-item
      width="20%"
      label="Binning"
      :item="binning"
    />
    <parameter-list-item
      width="20%"
      label="Image Size"
      :item="imageSize"
    />
    <parameter-list-item
      width="20%"
      label="No. Movies"
      :item="noMovies"
    />
    <parameter-list-item
      width="20%"
      label="Frames/Movie"
      :item="framesMovie"
    />
    <parameter-list-item
      width="20%"
      label="Frame Length"
      :item="frameLength"
    />
    <parameter-list-item
      width="20%"
      label="Total Dose"
      :item="totalDose"
    />
    <parameter-list-item
      v-if="isStopped"
      width="20%"
      label="Status"
      item="Stopped"
    />
    <parameter-list-item
      width="100%"
      label="Comment"
      :item="dataCollection.COMMENTS"
    />
  </parameter-list>
</template>

<script>
import KvLambda from 'modules/types/em/components/kv-lambda'
import parameterFormats from 'modules/types/em/components/parameter-formats'
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'
import unitsHtml from 'modules/types/em/components/units-html.js'

export default {
    'name': 'DataCollectionHeader',
    'components': {
        'parameter-list': ParameterList,
        'parameter-list-item': ParameterListItem,
    },
    'mixins': [parameterFormats],
    'props': {
        'dataCollection': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'voltage': function() {
            const kvLambda = KvLambda()
            return this.numberWithUnit(
                kvLambda.l2kV(this.dataCollection.WAVELENGTH),
                'kV'
            )
        },
        'c1Lens': function() {
            return this.datumWithUnit(this.dataCollection.C1LENS, '%')
        },
        'c2Lens': function() {
            return this.datumWithUnit(this.dataCollection.C2LENS, '%')
        },
        'c3Lens': function() {
            return this.datumWithUnit(this.dataCollection.C3LENS, '%')
        },
        'c1Aperture': function() {
            return this.datumWithUnit(this.dataCollection.C1APERTURE, '&mu;m')
        },
        'c2Aperture': function() {
            return this.datumWithUnit(this.dataCollection.C2APERTURE, '&mu;m')
        },
        'c3Aperture': function() {
            return this.datumWithUnit(this.dataCollection.C3APERTURE, '&mu;m')
        },
        'objAperture': function() {
            return this.datumWithUnit(this.dataCollection.OBJAPERTURE, '&mu;m')
        },
        'hasMagnification': function() {
            return !(!this.dataCollection.MAGNIFICATION)
        },
        'magnification': function() {
            return this.datumWithUnit(this.dataCollection.MAGNIFICATION, 'x')
        },
        'hasEnergyFilter': function() {
            return !(!this.dataCollection.SLITGAPHORIZONTAL)
        },
        'energyFilter': function() {
            return this.datumOrBlank(this.dataCollection.SLITGAPHORIZONTAL)
        },
        'phasePlate': function() {
            return this.dataCollection.PHASEPLATE == 1 ? 'Yes' : 'No'
        },
        'beamSize': function() {
            return this.dimensions(
                this.datumWithUnit(this.dataCollection.BSX, '&mu;m'),
                this.datumWithUnit(this.dataCollection.BSY, '&mu;m')
            )
        },
        'detector': function() {
            return (
                this.datumOrBlank(this.dataCollection.DETECTORMANUFACTURER) +
                ' ' +
                this.datumOrBlank(this.dataCollection.DETECTORMODEL)
            ).trim()
        },
        'detectorMode': function() {
            return this.datumOrBlank(this.dataCollection.DETECTORMODE)
        },
        'samplePixelSize': function() {
            return this.datumWithUnit(
                this.dataCollection.PIXELSIZEONIMAGE, 'Å/pixel'
            )
        },
        'binning': function() {
            return this.datumWithUnit(this.dataCollection.BINNING, 'pix')
        },
        'imageSize': function() {
            return this.dimensions(
                this.datumWithUnit(this.dataCollection.IMAGESIZEX, 'pix'),
                this.datumWithUnit(this.dataCollection.IMAGESIZEY, 'pix')
            )
        },
        'noMovies': function() {
            return this.datumOrBlank(this.dataCollection.NUMIMG)
        },
        'framesMovie': function() {
            return this.datumOrBlank(this.dataCollection.NUMBEROFPASSES)
        },
        'frameLength': function() {
            return this.numberWithUnit(
                parseFloat(this.dataCollection.EXPOSURETIME) /
                    parseInt(this.dataCollection.NUMBEROFPASSES, 10),
                's'
            )
        },
        'totalDose': function() {
            return this.datumWithUnit(
                this.dataCollection.TOTALDOSE,
                unitsHtml.electron + '/' + unitsHtml.angstromSquared
            )
        },
        'isStopped': function() {
            return this.dataCollection.STATE == false
        },
    },
}
</script>
