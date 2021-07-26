export default {
  data() {
    return {
      containerId: null,
      sample: {},
      editingRow: null,
    };
  },
  methods: {
    editRow(row) {
      this.sample = row;
      this.sample.CONTAINERID = this.containerId;
      this.editingRow = row.LOCATION;
    },
    displayInputForm(row) {
      return (
        !this.containerId || Number(this.editingRow) === Number(row.LOCATION)
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
      return this.formatSelectData(selectData, data, property).value;
    },
  },
};