<template>
  <div class="content">
    <h1 v-if="gid">Edit Sample Group</h1>
    <h1 v-else>Add Sample Group</h1>

    <form>
      <label for="name">Sample Group Name</label>
      <input v-model="groupName" type="text" placeholder="group name" />
    </form>

    <div v-if="sampleGroupMembers.length > 0" class="content">
      <h1>Sample Group {{ sampleGroupName }}</h1>
      <table-panel
        :headers="sampleGroupHeaders"
        :data="sampleGroupMembers"
      ></table-panel>
    </div>

    <h1>Shipments</h1>
    <table-panel
      :headers="shipmentHeaders"
      :data="shipments"
      @row-clicked="onShipmentSelected"
    ></table-panel>

    <div v-if="dewars.length > 0" class="content">
      <h1>Dewars</h1>
      <table-panel
        :headers="dewarHeaders"
        :data="dewars"
        @row-clicked="onDewarSelected"
      ></table-panel>
    </div>

    <div v-if="containers.length > 0" class="content">
      <h1>Containers</h1>
      <table-panel
        :headers="containerHeaders"
        :data="containers"
        @row-clicked="onContainerSelected"
      ></table-panel>
    </div>

    <container-graphic
      v-if="containerSelected"
      :selectedContainerName="selectedContainerName"
      :geometry="containerGeometry"
      :containerType="containerType"
    />

    <div class="tw-relative tw-mt-6">
      <button-component
        v-if="selectedSampleGroups.length"
        @perform-button-action="onSaveSampleGroup"
        class="tw-text-white tw-border-green-700 tw-bg-green-500 hover:tw-bg-green-600">
        Save Sample Group
      </button-component>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ContainerGraphic from './ContainerGraphic.vue'

import Table from 'app/components/utils/table.vue'
import Pagination from 'app/components/utils/pagination.vue'
import PaginationTable from 'app/components/utils/pagination-table.vue'
import ButtonComponent from 'app/components/utils/ButtonComponent.vue'

import SampleGroupsCollection from 'collections/samplegroups.js'
import ShipmentCollection from 'collections/shipments.js'
import DewarsCollection from 'collections/dewars.js'
import ContainersCollection from 'collections/containers.js'

import ContainerTypes from 'modules/shipment/collections/platetypes.js'

export default {
  name: 'sample-group-edit',
  props: {
    gid: Number,
    sampleGroup: Object,
  },
  components: {
    'table-panel': Table,
    'pagination-panel': Pagination,
    'container-graphic': ContainerGraphic,
    'pagination-table': PaginationTable,
    'button-component': ButtonComponent
  },
  data: function () {
    return {
      groupName: 'New Sample Group',
      lockName: this.gid ? true : false,
      sampleGroupHeaders: [
        { title: 'ID', key: 'BLSAMPLEID' },
        { title: 'Name', key: 'SAMPLE' },
        { title: 'Container', key: 'CONTAINER' },
        { title: 'Protein', key: 'PROTEIN' },
      ],
      sampleGroups: null, // backbone collection
      groups: [],
      shipmentHeaders: [
        { title: 'ID', key: 'SHIPPINGID' },
        { title: 'Name', key: 'SHIPPINGNAME' },
        { title: 'Status', key: 'STATUS' },
        { title: 'Number of Dewars', key: 'DCOUNT' },
      ],
      shipments: [],
      shipmentCollection: null,
      dewarHeaders: [
        { title: 'ID', key: 'DEWARID' },
        { title: 'Name', key: 'DEWARNAME' },
        { title: 'Facility Code', key: 'FACILITYCODE' },
        { title: 'BarCode', key: 'BARCODE' },
        { title: 'Status', key: 'DEWARSTATUS' },
      ],
      dewars: [],
      containerHeaders: [
        { title: 'ID', key: 'CONTAINERID' },
        { title: 'Name', key: 'NAME' },
        { title: 'Container Type', key: 'CONTAINERTYPE' },
        { title: 'BarCode', key: 'BARCODE' },
        { title: 'Dewar', key: 'DEWAR' },
        { title: 'Shipment', key: 'SHIPMENT' },
      ],
      containers: [],
      containerTypes: null,
      containerGeometry: {
        capacity: 0,
        columns: 0,
        drops: {
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
        well: null,
      },
      containerType: null, // Can be plate or puck
      sampleGroupMembers: [],
      sampleGroupName: null,
      containerSelected: false,
      selectedContainerName: ''
    };
  },
  computed: {
    ...mapGetters({
      selectedSampleGroups: ['sampleGroups/getSelectedSampleGroups']
    })
  },
  created: function () {
    this.containerTypes = new ContainerTypes();
    this.shipmentCollection = new ShipmentCollection();
    this.sampleGroups = new SampleGroupsCollection();
  },
  mounted() {
    this.fetchSampleGroupsAndShipments()
  },
  methods: {
    async fetchSampleGroupsAndShipments() {
      try {
        this.$store.dispatch('updateLoadingState', true)

        await this.getSampleGroups()
        await this.getShipments()
      } catch (error) {
        console.log('Sample group error ' + JSON.stringify(err))
      } finally {
        this.$store.dispatch('updateLoadingState', false)
      }
    },
    onSaveSampleGroup() {
      // TODO: Save Sample Group to Database
    },
    async onShipmentSelected(item) {
      this.containers = [];
      await this.getDewars(item.SHIPPINGID)
    },
    onDewarSelected(item) {
      this.containers = [
        {
          AGE: '155.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '18:14 03-01-2021',
          LASTINSPECTIONDAYS: '38.8',
          INSPECTIONS: '13',
          PROP: 'mx21314',
          BLTIMESTAMP: '2020-09-09 10:34:05',
          SAMPLECHANGERLOCATION: '15',
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '182491',
          NAME: 'VMXi-AB1383_Thl',
          DEWAR: 'Dewar1',
          SHIPMENT: 'VMXi test',
          DEWARID: '42643',
          SHIPPINGID: '37567',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-158',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS: '',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB1383',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '3',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: 'xia2/DIALS',
          LASTQUEUECOMPLETED: '13:59 16-10-2020',
          LASTQUEUEDWELL: '-16',
          BARCODECHECK: null,
        },
        {
          AGE: '155.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '18:01 03-01-2021',
          LASTINSPECTIONDAYS: '38.8',
          INSPECTIONS: '13',
          PROP: 'mx21314',
          BLTIMESTAMP: '2020-09-09 10:32:32',
          SAMPLECHANGERLOCATION: '19',
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '182488',
          NAME: 'VMXi-AB1382_thl',
          DEWAR: 'Dewar1',
          SHIPMENT: 'VMXi test',
          DEWARID: '42643',
          SHIPPINGID: '37567',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-157',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS: '',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB1382',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '2',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: 'xia2/DIALS',
          LASTQUEUECOMPLETED: '10:48 08-10-2020',
          LASTQUEUEDWELL: '-20',
          BARCODECHECK: null,
        },
        {
          AGE: '155.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '18:27 03-01-2021',
          LASTINSPECTIONDAYS: '38.8',
          INSPECTIONS: '13',
          PROP: 'mx21314',
          BLTIMESTAMP: '2020-09-09 10:30:06',
          SAMPLECHANGERLOCATION: '15',
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '182485',
          NAME: 'VMXi-AB1381_Thau',
          DEWAR: 'Dewar1',
          SHIPMENT: 'VMXi test',
          DEWARID: '42643',
          SHIPPINGID: '37567',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-156',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS: '',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB1381',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '754',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: 'xia2/DIALS',
          LASTQUEUECOMPLETED: '10:58 08-10-2020',
          LASTQUEUEDWELL: '-30',
          BARCODECHECK: null,
        },
        {
          AGE: '155.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '18:39 03-01-2021',
          LASTINSPECTIONDAYS: '38.8',
          INSPECTIONS: '13',
          PROP: 'mx21314',
          BLTIMESTAMP: '2020-09-09 10:28:06',
          SAMPLECHANGERLOCATION: '15',
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '182482',
          NAME: 'VMXi-AB1380_thau',
          DEWAR: 'Dewar1',
          SHIPMENT: 'VMXi test',
          DEWARID: '42643',
          SHIPPINGID: '37567',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-155',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS: '',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB1380',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '57',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: 'xia2/DIALS',
          LASTQUEUECOMPLETED: '11:22 21-10-2020',
          LASTQUEUEDWELL: '-6',
          BARCODECHECK: null,
        },
        {
          AGE: '385.1',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '19:07 29-07-2020',
          LASTINSPECTIONDAYS: '196.7',
          INSPECTIONS: '14',
          PROP: 'mx21314',
          BLTIMESTAMP: '2020-01-23 10:33:32',
          SAMPLECHANGERLOCATION: '15',
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '167880',
          NAME: 'protK-AB5476',
          DEWAR: 'Dewar1',
          SHIPMENT: '_______________',
          DEWARID: '35061',
          SHIPPINGID: '30606',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-154',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS: 'proteinase K (15 mg/mL) with Morpheus crys. screen',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB5476',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '5',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: null,
          LASTQUEUECOMPLETED: '10:38 08-10-2020',
          LASTQUEUEDWELL: '-12',
          BARCODECHECK: null,
        },
        {
          AGE: '385.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '20:32 29-07-2020',
          LASTINSPECTIONDAYS: '196.7',
          INSPECTIONS: '14',
          PROP: 'mx21314',
          BLTIMESTAMP: '2020-01-23 10:31:39',
          SAMPLECHANGERLOCATION: null,
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '167877',
          NAME: 'protK-AB5475',
          DEWAR: 'Dewar1',
          SHIPMENT: '_______________',
          DEWARID: '35061',
          SHIPPINGID: '30606',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-151',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS: 'proteinase K (15 mg/mL) with Proplex crys. screen',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB5475',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '7',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: null,
          LASTQUEUECOMPLETED: null,
          LASTQUEUEDWELL: null,
          BARCODECHECK: null,
        },
        {
          AGE: '385.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '20:07 29-07-2020',
          LASTINSPECTIONDAYS: '196.7',
          INSPECTIONS: '14',
          PROP: 'mx21314',
          BLTIMESTAMP: '2020-01-23 10:29:40',
          SAMPLECHANGERLOCATION: '18',
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '167874',
          NAME: 'protK-AB5474',
          DEWAR: 'Dewar1',
          SHIPMENT: '_______________',
          DEWARID: '35061',
          SHIPPINGID: '30606',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-153',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS: 'proteinase K (15 mg/mL) with JCSG+ crys. screen',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB5474',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '11',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: null,
          LASTQUEUECOMPLETED: '13:34 31-01-2020',
          LASTQUEUEDWELL: '-87',
          BARCODECHECK: null,
        },
        {
          AGE: '385.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '20:20 29-07-2020',
          LASTINSPECTIONDAYS: '196.7',
          INSPECTIONS: '14',
          PROP: 'mx21314',
          BLTIMESTAMP: '2020-01-23 10:26:51',
          SAMPLECHANGERLOCATION: null,
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '167868',
          NAME: 'protK-AB5473',
          DEWAR: 'Dewar1',
          SHIPMENT: '_______________',
          DEWARID: '35061',
          SHIPPINGID: '30606',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-152',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS: 'proteinase K (15 mg/mL) with PACT crys. screen',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB5473',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '0',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: null,
          LASTQUEUECOMPLETED: null,
          LASTQUEUEDWELL: null,
          BARCODECHECK: null,
        },
        {
          AGE: '500.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '19:31 05-04-2020',
          LASTINSPECTIONDAYS: '311.7',
          INSPECTIONS: '9',
          PROP: 'mx21314',
          BLTIMESTAMP: '2019-09-30 11:19:00',
          SAMPLECHANGERLOCATION: '15',
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '157015',
          NAME: 'haem-AB1068',
          DEWAR: 'Dewar1',
          SHIPMENT: '_______________',
          DEWARID: '35061',
          SHIPPINGID: '30606',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-150',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS:
            'haemoglobin + phosphate buffer 50 mg/ml with Proplex crys. screen',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB1068',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '28',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: null,
          LASTQUEUECOMPLETED: '10:39 22-07-2020',
          LASTQUEUEDWELL: '-26',
          BARCODECHECK: null,
        },
        {
          AGE: '500.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '20:04 05-04-2020',
          LASTINSPECTIONDAYS: '311.7',
          INSPECTIONS: '9',
          PROP: 'mx21314',
          BLTIMESTAMP: '2019-09-30 11:16:44',
          SAMPLECHANGERLOCATION: '19',
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '157012',
          NAME: 'haem-AB1069',
          DEWAR: 'Dewar1',
          SHIPMENT: '_______________',
          DEWARID: '35061',
          SHIPPINGID: '30606',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-149',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS:
            'haemoglobin + phosphate buffer 50 mg/ml with JCSG+ crys. screen',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB1069',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '27',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: null,
          LASTQUEUECOMPLETED: '15:02 09-12-2019',
          LASTQUEUEDWELL: '-14591',
          BARCODECHECK: null,
        },
        {
          AGE: '500.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '19:17 05-04-2020',
          LASTINSPECTIONDAYS: '311.7',
          INSPECTIONS: '9',
          PROP: 'mx21314',
          BLTIMESTAMP: '2019-09-30 11:15:05',
          SAMPLECHANGERLOCATION: '18',
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '157009',
          NAME: 'haem-AB1070',
          DEWAR: 'Dewar1',
          SHIPMENT: '_______________',
          DEWARID: '35061',
          SHIPPINGID: '30606',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-148',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS:
            'haemoglobin + phosphate buffer 50 mg/ml with Morpheus crys. screen',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB1070',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '7',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: null,
          LASTQUEUECOMPLETED: '15:29 09-12-2019',
          LASTQUEUEDWELL: '-14612',
          BARCODECHECK: null,
        },
        {
          AGE: '500.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '19:04 05-04-2020',
          LASTINSPECTIONDAYS: '311.7',
          INSPECTIONS: '9',
          PROP: 'mx21314',
          BLTIMESTAMP: '2019-09-30 11:13:09',
          SAMPLECHANGERLOCATION: '14',
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '157006',
          NAME: 'haem-AB1071',
          DEWAR: 'Dewar1',
          SHIPMENT: '_______________',
          DEWARID: '35061',
          SHIPPINGID: '30606',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-147',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS:
            'haemoglobin + phosphate buffer 50 mg/ml with PACT crys. screen',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB1071',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '26',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: null,
          LASTQUEUECOMPLETED: '18:29 09-12-2019',
          LASTQUEUEDWELL: '-14785',
          BARCODECHECK: null,
        },
        {
          AGE: '511.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '15:07 08-11-2019',
          LASTINSPECTIONDAYS: '460.9',
          INSPECTIONS: '11',
          PROP: 'mx21314',
          BLTIMESTAMP: '2019-09-19 11:49:31',
          SAMPLECHANGERLOCATION: null,
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '155599',
          NAME: 'haem-AB5472',
          DEWAR: 'Dewar1',
          SHIPMENT: '_______________',
          DEWARID: '35061',
          SHIPPINGID: '30606',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-136',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS: 'haemoglobin 50mg/mL with PACT crys. screen',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB5472',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '0',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: null,
          LASTQUEUECOMPLETED: null,
          LASTQUEUEDWELL: null,
          BARCODECHECK: null,
        },
        {
          AGE: '507.1',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '2',
          TEMPERATURE: '4',
          IMAGER: 'VMXi 4c',
          LASTINSPECTION: '22:03 29-03-2020',
          LASTINSPECTIONDAYS: '318.6',
          INSPECTIONS: '14',
          PROP: 'mx21314',
          BLTIMESTAMP: '2019-09-19 11:48:38',
          SAMPLECHANGERLOCATION: null,
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '155596',
          NAME: 'Th_VMXi-AB5362',
          DEWAR: 'Dewar1',
          SHIPMENT: 'VMXi_HM',
          DEWARID: '33195',
          SHIPPINGID: '28944',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-146',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '2',
          REQUESTEDIMAGER: 'VMXi 4c',
          COMMENTS: '4',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB5362',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '175',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: null,
          LASTQUEUECOMPLETED: null,
          LASTQUEUEDWELL: null,
          BARCODECHECK: null,
        },
        {
          AGE: '511.0',
          ALLOW_ADHOC: '1',
          SCHEDULE: 'Fibonacci',
          SCHEDULEID: '11',
          SCREENID: null,
          SCREEN: null,
          IMAGERID: '1',
          TEMPERATURE: '20',
          IMAGER: 'VMXi 20c',
          LASTINSPECTION: '21:14 16-10-2019',
          LASTINSPECTIONDAYS: '483.6',
          INSPECTIONS: '10',
          PROP: 'mx21314',
          BLTIMESTAMP: '2019-09-19 11:47:57',
          SAMPLECHANGERLOCATION: '18',
          BEAMLINELOCATION: null,
          DEWARSTATUS: 'opened',
          CONTAINERTYPE: 'CrystalQuickX',
          CAPACITY: '192',
          CONTAINERSTATUS: 'in_storage',
          CONTAINERID: '155593',
          NAME: 'haem-AB5471',
          DEWAR: 'Dewar1',
          SHIPMENT: '_______________',
          DEWARID: '35061',
          SHIPPINGID: '30606',
          SAMPLES: '192',
          CONTAINERQUEUEID: null,
          QUEUEDTIMESTAMP: null,
          VISIT: 'mx21314-137',
          BEAMLINENAME: 'i02-2',
          REQUESTEDRETURN: '0',
          REQUESTEDIMAGERID: '1',
          REQUESTEDIMAGER: 'VMXi 20c',
          COMMENTS: 'haemoglobin 50mg/mL with JCSG+ crys. screen',
          EXPERIMENTTYPE: null,
          STORAGETEMPERATURE: null,
          BARCODE: 'VMXi-AB5471',
          REGISTRY: null,
          CONTAINERREGISTRYID: null,
          SUBSAMPLES: '7',
          FIRSTEXPERIMENTBEAMLINE: null,
          PIPELINE: null,
          LASTQUEUECOMPLETED: null,
          LASTQUEUEDWELL: null,
          BARCODECHECK: null,
        },
      ];

      // this.getContainers(item.DEWARID).then( (result ) => {
      //   this.containers = result.toJSON()
      // })
    },
    setContainerType(type) {
      // let type = 'CrystalQuickX'
      // let type = 'FilmBatch'
      // let type = 'MitegenInSitu_3_Drop'
      // Returns a backbone model that we need to map to our geometry structure
      let container = this.containerTypes.findWhere({ name: type });

      this.containerGeometry.capacity = container.get('capacity');
      this.containerGeometry.columns = container.get('well_per_row');
      this.containerGeometry.drops.x = container.get('drop_per_well_x');
      this.containerGeometry.drops.y = container.get('drop_per_well_y');
      this.containerGeometry.drops.h = container.get('drop_height');
      this.containerGeometry.drops.w = container.get('drop_width');
      this.containerGeometry.well = container.get('well_drop') > 0 ? container.get('well_drop') : null;

      this.containerType = container.get('well_per_row') ? 'plate' : 'puck';

      this.containerSelected = true;
    },
    onContainerSelected(item) {
      let type = item.CONTAINERTYPE;
      this.selectedContainerName = `${item.CONTAINERID} - ${item.BARCODE}`
      this.setContainerType(type);
    },
    // Wrap the method to get collection as promise
    async getSampleGroups() {
      const result = await  new Promise( (resolve, reject) => {
        this.sampleGroups.fetch( {
          success: function(collection) {
            resolve(collection)
          },
          error: function(err) {
            reject(err)
          }
        })
      })

      let collection = result.groups();
      this.sampleGroups = Object.assign(this.sampleGroups, result);
      this.groups = collection.toJSON();
    },
    async getShipments() {
      const result = await  new Promise( (resolve, reject) => {
        this.shipmentCollection.fetch( {
          success: function(collection) {
            resolve(collection)
          },
          error: function(err) {
            reject(err)
          }
        })
      })

      this.shipments = result.toJSON();
    },
    // Wrap the method to get collection as promise
    async getDewars(id) {
      let dewars = new DewarsCollection(null, { id: id });

      const result = await  new Promise((resolve, reject) => {
        dewars.fetch({
          success: function (collection) {
            resolve(collection);
          },
          error: function (err) {
            reject(err);
          },
        });
      })

      this.dewars = result.toJSON();
    },
    getContainers(id) {
      let containers = new ContainersCollection(null, { id: id });

      return new Promise((resolve, reject) => {
        containers.fetch({
          success: function (collection) {
            resolve(collection);
          },
          error: function (err) {
            reject(err);
          },
        });
      });
    }
  }
};
</script>
