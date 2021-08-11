export default {
  data() {
    return {
      containerId: null,
      sample: {},
      editingRow: null,
      screeningMethodList: [
        {
          value: "None",
          text: "None",
        },
        {
          value: "Better Than",
          text: "Better Than",
        },
        {
          value: "Collect Best N",
          text: "Collect Best N",
        },
      ],
    };
  },
  props: {
    proteins: {
      type: Array,
    },
    experimentKind: {
      type: String,
    },
    containerId: {
      type: Number,
    },
  },
  computed: {
    inputValue: {
      get() {
        return this.$store.state.samples.samples;
      },
      set(val) {
        this.$store.commit("samples/set", val);
      },
    },
    proteinsOptionsList() {
      return this.proteins
        .toJSON()
        .map((item) => ({ value: item.PROTEINID, text: item.ACRONYM }));
    },
    experimentKindList() {
      return this.$experimentKindList;
    },
    centeringMethodList() {
      return this.$centeringMethods.reduce(
        (acc, curr) => {
          if (curr) acc.push({ value: curr, text: curr });

          return acc;
        },
        [{ value: "xray", text: "X-Ray" }]
      );
    },
    spaceGroupList() {
      return this.$spaceGroups.map((item) => ({ value: item, text: item }));
    },
    anomalousOptionsList() {
      return this.$anomalousList.map((item) => ({ value: item, text: item }));
    },
    sampleLocation() {
      return this.$sampleLocation()
    },
    sampleGroups() {
      return this.$sampleGroups()
    }
  },
  methods: {
    handleProteinSelection(index, data) {
      this.$store.commit("samples/update", {
        index,
        key: "PROTEINID",
        value: data.value,
      });
    },
    editRow(row) {
      this.sample = row;
      this.sample.CONTAINERID = this.containerId;
      this.editingRow = row.LOCATION;
    },
    displayInputForm(row) {
      return (
        !this.containerId
      );
    },
    formatSelectData(selectData, data, property) {
      const matchedSelectData = selectData.find(
        (select) => select.value === data[property]
      );

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
      this.sample.ACRONYM = this.getProteinAcronym(this.sample.PROTEINID);
      // Save the sample data to the store and trigger save to the server
      this.$store.commit("samples/setSample", {
        index: sampleIndex,
        data: this.sample,
      });
      this.saveSample(location);
      // Reset the local sample data to start clean on next edit
      this.resetSampleToEdit();
    },

    onEditSample: function(row) {
      this.sample = Object.assign(this.sample, row);
      // Set the sample container id - this will work if we are adding a new sample in the table or editing an existing one
      this.sample.CONTAINERID = this.containerId;
      this.editRowLocation = row["LOCATION"];
    },

    onCancelEdit: function() {
      this.resetSampleToEdit();
    },

    saveSample: function(location) {
      // Delegating the save to the server to parent sample-editor
      this.$emit("save-sample", location);
    },

    resetSampleToEdit: function() {
      this.editRowLocation = "";
      // Reset temporary sample model
      this.sample = Object.assign({});
    },

    isEditRowLocation: function(row) {
      // Used to indicate if the provided row should show in edit mode
      if (!row["LOCATION"]) return false;
      return this.editRowLocation == row["LOCATION"] ? true : false;
    },

    // If a proteinId is updated we need to also update the text ACRONYM because its a plan text value
    // and not linked directly to the protein id value for each sample
    getProteinAcronym: function(id) {
      let protein = this.proteins.findWhere({ PROTEINID: id });
      if (protein) return protein.get("ACRONYM");
      else return null;
    },
  },
  inject: [
    "$spaceGroups",
    "$centeringMethods",
    "$anomalousList",
    "$experimentKindList",
    "$showUDCColumns",
    "$sampleLocation",
    "$sampleGroups"
  ]
};
