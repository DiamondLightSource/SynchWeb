<template>
  <div class="content">
    <h1>Sample Location {{sampleLocation}}</h1>

    <!-- Only allow clone operations when creating the puck/plate -->
    <plate-sample-controls
      v-if="!containerId"
      @clone-container="onClonePlate"
      @clear-container="onClearPlate"
      @clear-container-sample="onClearSample"
      @clone-container-column="onCloneContainerColumn"
      @clone-container-row="onCloneContainerRow"
    />

    <div class="form">
      <validation-provider slim :rules="inputValue[sampleIndex].NAME ? 'required|min_value:1' : ''" name="Protein Acronym Id" v-slot="{ errors }">
        <base-input-select
        label="Protein"
        v-model="inputValue[sampleIndex].PROTEINID"
        optionValueKey="PROTEINID"
        optionTextKey="ACRONYM"
        defaultText=" - "
        :options="availableProteins"
        :errorMessage="errors[0]"/>
      </validation-provider>

      <validation-provider slim :rules="inputValue[sampleIndex].PROTEINID > -1 ? 'required|alpha_dash|max:12' : ''" name="Sample name" v-slot="{ errors }">
        <base-input-text
          label="Sample Name"
          v-model="inputValue[sampleIndex].NAME"
          name="SAMPLE_NAME" 
          :errorMessage="errors[0]"/>
      </validation-provider>

      <validation-provider slim rules="decimal|min_value:10|max_value:100" name="Volume" :vid="volume" v-slot="{ errors }">
        <base-input-text
        label="Volume"
        v-model="inputValue[sampleIndex].VOLUME"
        name="VOLUME" 
        :errorMessage="errors[0]"/>
      </validation-provider>
    
      <div v-if="containerId">
        <button v-if="inputValue[sampleIndex].BLSAMPLEID" class="button submit" @click="onSaveSample">Save Sample</button>
        <button v-else class="button submit" @click="onSaveSample">Add Sample</button>
      </div>

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
  name: 'single-sample-default',
	mixins: [SingleSampleMixin],
  components: {
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-checkbox': BaseInputCheckbox,
    'validation-provider': ValidationProvider,
		'plate-sample-controls': PlateSampleControls,
  },
	methods: {
    onClonePlate: function() {
      this.$emit('clone-container', this.sampleIndex)
    },
    onClearPlate: function() {
      this.$emit('clear-container')
    },
    onClearSample: function() {
      let location = this.sampleIndex + 1

      this.$emit('clear-sample', location)
    },
    onCloneContainerColumn: function() {
      let location = this.sampleIndex + 1
      this.$emit('clone-container-column', location)
    },
    onCloneContainerRow: function() {
      let location = this.sampleIndex + 1
      this.$emit('clone-container-row', location)
    },
    onSaveSample: function() {
      let location = this.sampleIndex + 1
      let containerId = this.inputValue[this.sampleIndex].CONTAINERID
      if (!containerId) this.inputValue[this.sampleIndex].CONTAINERID = this.containerId

      this.$emit('save-sample', location)
    }
	}
}
</script>