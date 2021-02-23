<template>
  <div class="content">
    <h1>Samples</h1>

    <div class="la puck_controls">
      <a class="button clonepuck" @click.prevent="$emit('clone-puck')" href="#" title="Clone entire plate from first sample"><i class="fa fa-plus"></i> Clone from First Sample</a>
      <a class="button clearpuck" @click.prevent="$emit('clear-puck')" href="#" title="Clear entire plate"><i class="fa fa-times"></i> Clear Plate</a>
      <!-- <a class="button extrainfo r" @click.prevent="toggleExtra" href="#" title="Show extra fields"><i :class="['fa extra-state', extraToggle ? 'fa-plus' : 'fa-minus']"></i> Extra Fields</a> -->
    </div>

    <validation-observer tag="div">
      <table-component
      :key="tkey"
        :headers="sampleHeaders"
        :data="sampleData"
        >
        <template slot="content" slot-scope="{ row }">
          <td>{{row['LOCATION']}}</td>
          <td class="name"><validation-provider rules="required" v-slot="{ errors }"><sw-select-input v-model="row['PROTEINID']" name="proteins" :options="availableProteins" optionValueKey="PROTEINID" optionTextKey="ACRONYM" :errorMessage="errors[0]"/></validation-provider></td>
          <td><sw-select-input v-model="row['TYPE']" optionValueKey="ID" optionTextKey="TYPE" :options="sampleTypes"/></td>
          <validation-provider tag="td" rules="required" v-slot="{ errors }"><sw-text-input v-model="row['NAME']" :quiet="true" :errorMessage="errors[0]"/></validation-provider>
          <td><sw-select-input v-model="row['COLUMN']" name="purification" :options="purificationColumns" optionValueKey="PURIFICATIONCOLUMNID" optionTextKey="NAME" :errorMessage="errors[0]"/></td>
          <td><sw-text-input v-model="row['VOLUME']"/></td>
          <td v-show="experimentKind == 'robot'"><sw-text-input v-model="row['ROBOTPLATETEMPERATURE']"/></td>
          <td v-show="experimentKind == 'robot'"><sw-text-input v-model="row['EXPOSURETEMPERATURE']"/></td>
        </template>
      </table-component>
    </validation-observer>
    <!-- For testing only  -->
    <button class="button submit" @click.prevent="onSaveSamples">Test Save</button>

  </div>
</template>

<script>

import PurificationColumns from 'modules/shipment/collections/purificationcolumns'

import SwTextInput from 'app/components/forms/sw_text_input.vue'
import SwSelectInput from 'app/components/forms/sw_select_input.vue'
import SwTextAreaInput from 'app/components/forms/sw_textarea_input.vue'
import SwCheckboxInput from 'app/components/forms/sw_checkbox_input.vue'
import Table from 'app/components/utils/table.vue'

import { ValidationObserver, ValidationProvider }  from 'vee-validate'

export default {
  name: 'new-sample-plate',
  components: {
    'sw-select-input': SwSelectInput,
    'sw-text-input': SwTextInput,
    'sw-textarea-input': SwTextAreaInput,
    'sw-checkbox-input': SwCheckboxInput,
    'validation-observer': ValidationObserver,
    'validation-provider': ValidationProvider,
    'table-component': Table,
  },
  props: {
    proteins: {
      type: Array,
    },
    // Passed v-model
    value: {
      type: Object,
      required: true
    },
    experimentKind: {
      type: String,
    }
  },
  data: function() {
    return {
      purificationColumns: [],
      purificationColumn: '',

      sampleHeaders: [
        {key: 'LOCATION', title: 'Location'},
        {key: 'PROTEINID', title: 'Acronym'},
        {key: 'TYPE', title: 'Type'},
        {key: 'NAME', title: 'Name'},
        {key: 'COLUMN', title: 'Column'},
        {key: 'VOLUME', title: 'Volume'},
      ],
      sampleData: [
        {LOCATION: "1", NAME: "Sample 1", PROTEINID: "", COLUMN: "1", TYPE: "", VOLUME: "", EXPOSURETEMPERATURE: "", ROBOTPLATETEMPERATURE: ""},
        {LOCATION: "2", NAME: "Sample 2", PROTEINID: "", COLUMN: "2", TYPE: "", VOLUME: "", EXPOSURETEMPERATURE: "", ROBOTPLATETEMPERATURE: ""},
        {LOCATION: "3", NAME: "Sample 3", PROTEINID: "", COLUMN: "", TYPE: "", VOLUME: "", EXPOSURETEMPERATURE: "", ROBOTPLATETEMPERATURE: ""},
      ],
      sampleTypes: [
        {ID: 'Sample', TYPE: 'Sample'},
        {ID: 'Buffer', TYPE: 'Buffer'},
      ]
    }
  },
  created: function() {
    if (this.experimentKind == 'robot') {
      let robotHeaders = [{key: 'EXPOSURETEMPERATURE', title: 'Exposure Temperature'}, {key: 'ROBOTPLATETEMPERATURE', title: 'Robot Temperature'}]
      this.sampleHeaders = Object.assign({}, this.sampleHeaders, robotHeaders)
    }
    this.purificationColumnsCollection = new PurificationColumns()
    this.purificationColumns = []

    this.$store.dispatch('get_collection', this.purificationColumnsCollection).then( (result) => {
      this.purificationColumns = result.toJSON()
    })

    this.availableProteins = this.proteins.toJSON()
  },
  computed: {
    inputValue: {
      get() {
        return this.value
      },
      set(val) {
        console.log("Set value checked on inputValue")
        this.$emit('input', val)
      }
    },
  },

  methods: {
    toggleExtra: function() {
      this.extraToggle = !this.extraToggle
      this.$emit('extra-puck', this.extraToggle)
    },
    onSaveSamples: function() {
      this.tKey += 1
      console.log("SAve samples: " + JSON.stringify(this.sampleData))
    }
  }


}
</script>