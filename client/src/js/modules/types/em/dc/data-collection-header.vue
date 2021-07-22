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
import formatsUnits from 'modules/types/em/components/formats-units'
import KvLambda from 'modules/types/em/components/kv-lambda'
import ListItem from 'modules/types/em/components/list-item.vue'

export default {
    'name': 'DataCollectionHeader',
    'components': {
        'list-item': ListItem,
    },
    'mixins': [formatsUnits],
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
                this.dataCollection.PIXELSIZEONIMAGE,
                this.angstromPerPixel
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
                this.electronsPerAngstromSquared
            )
        },
        'isStopped': function() {
            return this.dataCollection.STATE == false
        },
    },
}
</script>
