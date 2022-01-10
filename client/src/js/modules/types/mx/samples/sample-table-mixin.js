import { createFieldsForSamples } from 'app/store/modules/store.samples'
import SampleGroup from 'models/samplegroup'

export default {
  data() {
    return {
      editingSample: {},
      editingRow: null,
      screeningMethodList: [
        {
          value: "none",
          text: "None",
        },
        {
          value: "all",
          text: "Better Than",
        },
        {
          value: "best",
          text: "Collect Best N",
        },
      ],
    };
  },
  props: {
    containerId: {
      type: Number,
    },
  },
  computed: {
    proteinsOptionsList() {
      return this.$proteins()
        .map(item => ({ value: item.PROTEINID, text: item.ACRONYM, SAFETYLEVEL: item.SAFETYLEVEL }));
    },
    experimentKindList() {
      return this.$experimentKindList();
    },
    centringMethodList() {
      return this.$centringMethods().filter(method => method).reduce(
        (acc, curr) => {
          if (curr) acc.push({ value: curr, text: curr });

          return acc;
        },
        []
      ).sort(this.sortSelectField);
    },
    spaceGroupList() {
      const spaceGroups = this.$spaceGroups().reduce((acc, item) => {
        acc.push({
          value: item.SPACEGROUPSHORTNAME,
          text: item.SPACEGROUPSHORTNAME
        })

        return acc
      }, [{ value: null, text: '' }])

      spaceGroups.sort(this.sortSelectField)

      return spaceGroups
    },
    anomalousOptionsList() {
      const anomalous = this.$anomalousList().reduce((prev, item) => {
        if (item) {
          prev.push({ value: item, text: item })
        }

        return prev
      }, [{ value: null, text: '' }])
      anomalous.sort(this.sortSelectField)

      return anomalous
    },
    sampleLocation() {
      return this.$sampleLocation()
    },
    sampleGroups() {
      return this.$sampleGroups()
    },
    shipments() {
      return this.$shipments()
    },
    dewars() {
      return this.$dewars()
    },
    containers() {
      return this.$containers()
    },
    queueForUDC() {
      return this.$queueForUDC()
    },
    sampleGroupSamples() {
      return this.$sampleGroupsSamples()
    },
    sampleGroupName() {
      if (this.sample['BLSAMPLEID'] && typeof Number(this.SAMPLEGROUP) === 'number') {
        const selectedSample = this.sampleGroupSamples.find(sample => sample['BLSAMPLEID'] === this.sample['BLSAMPLEID'])

        return selectedSample ? selectedSample['NAME'] : ''
      }

      return ''
    },
    ...createFieldsForSamples([
      'ABUNDANCE',
      'ANOMALOUSSCATTERER',
      'BLSUBSAMPLEID',
      'CODE',
      'CELL_A',
      'CELL_B',
      'CELL_C',
      'CELL_ALPHA',
      'CELL_BETA',
      'CELL_GAMMA',
      'CENTRINGMETHOD',
      'COMMENTS',
      'COMPOSITION',
      'CONTAINERID',
      'CRYSTALID',
      'DIMENSION1',
      'DIMENSION2',
      'DIMENSION3',
      'ENERGY',
      'EXPERIMENTALDENSITY',
      'EXPERIMENTKIND',
      'LOCATION',
      'LOOPTYPE',
      'MINIMUMRESOLUTION',
      'NAME',
      'PACKINGFRACTION',
      'PROTEINID',
      'REQUIREDRESOLUTION',
      'RADIATIONSENSITIVITY',
      'SAMPLEGROUP',
      'SCREENCOMPONENTGROUPID',
      'SCREENINGMETHOD',
      'SCREENINGCOLLECTVALUE',
      'SHAPE',
      'SPACEGROUP',
      'SYMBOL',
      'THEORETICALDENSITY',
      'USERPATH',
      'VOLUME',
      'VALID'
    ]),
    sampleGroupInputDisabled() {
      return this.$sampleGroupInputDisabled()
    },
    screeningMethodText() {
      if (this.sample['PROTEINID'] > 0) {
        const selectedScreeningMethod = this.screeningMethodList.find(item => item.value === this.sample['SCREENINGMETHOD'])

        return selectedScreeningMethod ? selectedScreeningMethod.text : 'None'
      }
    },
    experimentKindText() {
      if (this.sample['PROTEINID'] > 0) {
        const selectedExperimentKind = this.experimentKindList.find(item => item.value === this.sample['EXPERIMENTKIND'])

        return selectedExperimentKind ? selectedExperimentKind.text : ''
      }
    },
    containerStatus() {
      return this.$containerStatus()
    },
    canEditSample() {
      return this.containerStatus !== 'processing' || this.sample['DCC'] ? Number(this.sample['DCC']) < 1 : false
    }
  },
  methods: {
    editRow(row) {
      this.editingSample = row;
      this.editingSample.CONTAINERID = this.containerId;
      this.editingRow = row.LOCATION;
    },
    formatSelectData(selectData, data, property) {
      const matchedSelectData = selectData.find(select => select.value === data[property])

      if (!matchedSelectData) {
        return { value: "", text: "" };
      }

      return matchedSelectData;
    },
    selectDataValue(selectData, data, property) {
      return this.formatSelectData(selectData, data, property).text;
    },
    onSaveSample: function(row) {
      // Event triggered by confirmation of row edit
      // Locations start from 1, we want index into the samples array
      let location = row["LOCATION"];
      let sampleIndex = +location - 1;
      // The ACRONYM is determined by the PROTEINID
      // To keep our table updated in the UI set the acronym here as well
      // Means we don't need to refresh the table after saving data to the server
      this.editingSample.ACRONYM = this.getProteinAcronym(this.editingSample.PROTEINID);
      // Save the sample data to the store and trigger save to the server
      this.$store.commit("samples/setSample", {
        index: sampleIndex,
        data: this.editingSample,
      });
      this.saveSample(location);
      // Reset the local sample data to start clean on next edit
      this.resetSampleToEdit();
    },
    onEditSample: function(row) {
      this.editingSample = Object.assign(this.editingSample, row);
      // Set the sample container id - this will work if we are adding a new sample in the table or editing an existing one
      this.editingSample.CONTAINERID = this.containerId;
      this.editRowLocation = row["LOCATION"];
    },
    onCancelEdit: function() {
      this.resetSampleToEdit();
    },
    resetSampleToEdit: function() {
      this.editRowLocation = "";
      // Reset temporary sample model
      this.editingSample = Object.assign({});
    },
    // If a proteinId is updated we need to also update the text ACRONYM because its a plan text value
    // and not linked directly to the protein id value for each sample
    getProteinAcronym: function(id) {
      let protein = this.proteins.findWhere({ PROTEINID: id });
      if (protein) return protein.get("ACRONYM");
      else return null;
    },
    closeSampleEditing() {
      this.editingRow = null
    },
    sortSelectField(a, b) {
      const aText = a.text.toLowerCase()
      const bText = b.text.toLowerCase()

      if (aText < bText) {
        return -1
      }

      if (aText > bText) {
        return 1
      }

      return 0
    },
    async createNewSampleGroup(value) {
      this.$emit('update-sample-group-input-disabled', true)
      const sampleGroupModel = new SampleGroup({ NAME: value })
      await this.$store.dispatch('saveModel', { model: sampleGroupModel })
      this.$emit('update-sample-group-list')
    },
    canEditRow(location, editingRow) {
      return !this.containerId || location === editingRow
    }
  },
  inject: [
    "$spaceGroups",
    "$centringMethods",
    "$anomalousList",
    "$experimentKindList",
    "$sampleLocation",
    "$sampleGroups",
    "$shipments",
    "$dewars",
    "$containers",
    "$queueForUDC",
    "$proteins",
    "$sampleGroupsSamples",
    "$sampleGroupInputDisabled",
    "$containerStatus"
  ]
};
