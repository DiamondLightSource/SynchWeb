<template>
  <div class="content">
    <h1>Sample Location {{sampleLocation}}</h1>

    <plate-sample-controls
      @clone-plate="onClonePlate"
      @clear-plate="onClearPlate"
      @clear-plate-sample="onClearSample"
    />

    <div class="tw-flex tw-flex-row-reverse">
      <a class="button extrainfo r" href="#" title="Show extra fields"><i class="fa fa-plus"></i> Extra Fields</a>
    </div>
    <div class="form">
      <validation-provider slim :rules="inputValue.NAME ? 'required|min_value:1' : ''" v-slot="{ errors }">
        <base-input-select
        label="Protein"
        v-model="inputValue[sampleIndex].PROTEINID"
        optionValueKey="PROTEINID"
        optionTextKey="ACRONYM"
        defaultText=" - "
        :options="availableProteins"
        :quiet="true" 
        :errorMessage="errors[0]"/>
      </validation-provider>

      <validation-provider slim :rules="inputValue.PROTEINID > -1 ? 'required|alpha_dash|max:12' : ''" v-slot="{ errors }">
        <base-input-text
          label="Sample Name"
          v-model="inputValue[sampleIndex].NAME"
          name="SAMPLE_NAME" 
          :quiet="true" 
          :errorMessage="errors[0]"/>
      </validation-provider>

      <validation-provider slim rules="decimal|min_value:10|max_value:100" name="Volume" :vid="volume" v-slot="{ errors }">
        <base-input-text
        label="Volume"
        v-model="inputValue[sampleIndex].VOLUME"
        name="VOLUME" 
        :quiet="true" 
        :errorMessage="errors[0]"/>
      </validation-provider>
    
      <button v-if="containerId" class="button submit" @click="onSaveSample">Add Sample</button>
      <button v-else class="button submit" @click="onSaveSample">Save Sample</button>

    </div>

  </div>
</template>

<script>


import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'

import PlateSampleControls from 'modules/types/saxs/samples/plate-sample-controls.vue'
import { SingleSampleMixin } from 'modules/types/saxs/samples/experiments/single-sample-mixin.js'

import { ValidationProvider }  from 'vee-validate'

export default {
  name: 'single-sample-new',
	mixins: [SingleSampleMixin],
  components: {
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-checkbox': BaseInputCheckbox,
    'validation-provider': ValidationProvider,
		'plate-sample-controls': PlateSampleControls,
  },
  watch: {
    sampleLocation: function(newVal) {
      console.log("Single sample (default) now editing different sample - " + newVal)
    }
  },
	methods: {
		onClonePlate: function() {
			console.log("Clone Plate default from: " + this.sampleIndex)

			this.$emit('clone-container', this.sampleIndex)
		},
		onClearPlate: function() {
			console.log("Clear Plate default from: " + this.sampleIndex)

			this.$emit('clear-container')
		},
		onClearSample: function() {
			let location = this.sampleIndex + 1
			console.log("Clear Plate sample default index: " + this.sampleIndex)
			console.log("Clear Plate sample default location: " + location)

			this.$emit('clear-sample', location)
		},
		onSaveSample: function() {
			let location = this.sampleIndex + 1
			let cid = this.inputValue[this.sampleIndex].CONTAINERID
			if (!cid) this.inputValue[this.sampleIndex].CONTAINERID = this.containerId

			this.$emit('save-sample', location)
		}
	}
}
</script>