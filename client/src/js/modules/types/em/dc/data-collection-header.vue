<template>
  <ul
    class="clearfix"
  >
    <list-item
      label="Voltage"
      :item="voltage"
    />
    <list-item
      label="C1 Lens"
      :item="c1Lens"
      label2="Aperture"
      :item2="c1Aperture"
    />
    <list-item
      label="C2 Lens"
      :item="c2Lens"
      label2="Aperture"
      :item2="c2Aperture"
    />
    <list-item
      label="C3 Lens"
      :item="c3Lens"
      label2="Aperture"
      :item2="c3Aperture"
    />
    <list-item
      label="Obj Aperture"
      :item="objAperture"
    />
    <list-item
      label="Magnification"
      :item="magnification"
    />
    <list-item
      label="Magnification"
      :item="magnification"
    />
    <list-item
      v-if="hasEnergyFilter"
      label="Energy Filter"
      :item="energyFilter"
    />
    <list-item
      label="Phase Plate"
      :item="phasePlate"
    />
    <list-item
      label="Beamsize"
      :item="beamSize"
    />
    <list-item
      label="Detector"
      :item="detector"
    />
    <list-item
      label="Detector Mode"
      :item="detectorMode"
    />
    <list-item
      label="Sample Pixel Size"
      :item="samplePixelSize"
    />
    <list-item
      label="Binning"
      :item="binning"
    />
    <list-item
      label="Image Size"
      :item="imageSize"
    />
    <list-item
      label="No. Movies"
      :item="noMovies"
    />
    <list-item
      label="Frames/Movie"
      :item="framesMovie"
    />
    <list-item
      label="Frame Length"
      :item="frameLength"
    />
    <list-item
      label="Total Dose"
      :item="totalDose"
    />
    <list-item
      v-if="isStopped"
      label="Status"
      item="Stopped"
    />
    <!-- TODO: make comments work -->
    <li
      class="comment"
      title="Click to edit the comment for this data collection"
    >
      Comment:
      <span class="COMMENTS">{{ dataCollection.COMMENTS }}</span>
    </li>
  </ul>
</template>

<script>
import FormatsUnits from 'modules/types/em/utils/formats-units'
import KvLambda from 'modules/types/em/utils/kv-lambda'
import ListItem from 'modules/types/em/dc/header/list-item.vue'

export default {
    'name': 'DataCollectionHeader',
    'components': {
        'list-item': ListItem,
    },
    'props': {
        'dataCollection': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'formatsUnits': function() {
            return FormatsUnits(this.dataCollection)
        },
        'voltage': function() {
            const kvLambda = KvLambda()
            return this.formatsUnits.numberWithUnit(
                kvLambda.l2kV(this.dataCollection.WAVELENGTH),
                'kV'
            )
        },
        'c1Lens': function() {
            return this.formatsUnits.datumWithUnit('C1LENS', '%')
        },
        'c2Lens': function() {
            return this.formatsUnits.datumWithUnit('C2LENS', '%')
        },
        'c3Lens': function() {
            return this.formatsUnits.datumWithUnit('C3LENS', '%')
        },
        'c1Aperture': function() {
            return this.formatsUnits.datumWithUnit('C1APERTURE', '&mu;m')
        },
        'c2Aperture': function() {
            return this.formatsUnits.datumWithUnit('C2APERTURE', '&mu;m')
        },
        'c3Aperture': function() {
            return this.formatsUnits.datumWithUnit('C3APERTURE', '&mu;m')
        },
        'objAperture': function() {
            return this.formatsUnits.datumWithUnit('OBJAPERTURE', '&mu;m')
        },
        'hasMagnification': function() {
            return !(!this.dataCollection.MAGNIFICATION)
        },
        'magnification': function() {
            return this.formatsUnits.datumWithUnit('MAGNIFICATION', 'x')
        },
        'hasEnergyFilter': function() {
            return !(!this.dataCollection.SLITGAPHORIZONTAL)
        },
        'energyFilter': function() {
            return this.formatsUnits.fieldString('SLITGAPHORIZONTAL')
        },
        'phasePlate': function() {
            return this.dataCollection.PHASEPLATE == 1 ? 'Yes' : 'No'
        },
        'beamSize': function() {
            return this.formatsUnits.dimensions(
                this.formatsUnits.datumWithUnit('BSX', '&mu;m'),
                this.formatsUnits.datumWithUnit('BSY', '&mu;m')
            )
        },
        'detector': function() {
            return (
                this.formatsUnits.fieldString('DETECTORMANUFACTURER') + ' ' +
                this.formatsUnits.fieldString('DETECTORMODEL')
            ).trim()
        },
        'detectorMode': function() {
            return this.formatsUnits.fieldString('DETECTORMODE')
        },
        'samplePixelSize': function() {
            return this.formatsUnits.datumWithUnit(
                'PIXELSIZEONIMAGE',
                this.formatsUnits.angstrom + '/pix'
            )
        },
        'binning': function() {
            return this.formatsUnits.datumWithUnit('BINNING', 'pix')
        },
        'imageSize': function() {
            return this.formatsUnits.dimensions(
                this.formatsUnits.datumWithUnit('IMAGESIZEX', 'pix'),
                this.formatsUnits.datumWithUnit('IMAGESIZEY', 'pix')
            )
        },
        'noMovies': function() {
            return this.formatsUnits.fieldString('NUMIMG')
        },
        'framesMovie': function() {
            return this.formatsUnits.fieldString('NUMBEROFPASSES')
        },
        'frameLength': function() {
            return this.formatsUnits.numberWithUnit(
                parseFloat(this.dataCollection.EXPOSURETIME) /
                    parseInt(this.dataCollection.NUMBEROFPASSES, 10),
                's'
            )
        },
        'totalDose': function() {
            return this.formatsUnits.datumWithUnit(
                'TOTALDOSE',
                this.formatsUnits.electron + '/' +
                    this.formatsUnits.angstromSquared
            )
        },
        'isStopped': function() {
            return this.dataCollection.STATE == false
        },
    },
}
</script>
