<template>
  <div
    data-testid="container-sample-row"
    class="tw-flex tw-w-full tw-items-center"
    :class="{
      'tw-bg-table-body-background': sampleIndex % 2 === 0,
      'tw-bg-table-body-background-odd': sampleIndex % 2 === 1
    }"
  >
    <div class="location-column tw-text-center tw-py-1">
      {{ sample.LOCATION || sampleIndex + 1 }}
    </div>

    <validation-provider
      v-slot="{ errors }"
      class="tw-px-2 protein-column tw-py-1"
      tag="div"
      :rules="sample['NAME'] && (!containerId || editingRow === sample['LOCATION']) ? 'required' : ''"
      :name="`Sample ${sampleIndex + 1} Protein`"
      :vid="`sample ${sampleIndex + 1} protein`"
    >
      <combo-box
        v-model="PROTEINID"
        :is-disabled="!canEditRow(sample['LOCATION'], editingRow) || isContainerProcessing || sampleHasDataCollection"
        :data="proteinsOptionsList"
        class="tw-w-full protein-select"
        dataTestId="add-container-protein-select"
        text-field="ACRONYM"
        value-field="PROTEINID"
        :input-index="sampleIndex"
        default-text=""
        size="small"
        :canCreateNewItem="false"
        :exclude-element-class-list="['custom-add']"
      >
        <template slot-scope="{ option }">
          <span class="tw-flex tw-justify-between tw-w-full">
            <span class="tw-"><i
              v-if="option.SAFETYLEVEL === 'GREEN'"
              class="fa fa-check green"
              data-testid="add-container-approved"
            /></span>
            {{ option['ACRONYM'] }}
          </span>
        </template>
      </combo-box>
      <span>{{ errors[0] }}</span>
    </validation-provider>

    <validation-provider
      v-slot="{ errors }"
      tag="div"
      class="name-column tw-py-1 tw-px-2"
      :rules="sample['PROTEINID'] > -1 && (!containerId || editingRow === sample['LOCATION']) ? 'required|alpha_dash|max:25|' : ''"
      :name="`Sample ${sampleIndex + 1} Name`"
      :vid="`sample ${sampleIndex + 1} name`"
    >
      <base-input-text
        :disabled="!canEditRow(sample['LOCATION'], editingRow) || isContainerProcessing || sampleHasDataCollection"
        v-model.trim="NAME"
        input-class="tw-w-full tw-h-8"
        :error-message="errors[0]"
        :quiet="true"
        :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
        dataTestId="add-container-sample-name"
      />
    </validation-provider>

    <extended-validation-provider
      :ref="`sample_${sampleIndex}_sample_group`"
      class="tw-px-2 sample-group-column tw-py-1"
      :rules="`required_if:sample ${sampleIndex + 1} screening method,best`"
      :name="`Sample Group Sample ${sampleIndex + 1}`"
      :vid="`sample group sample ${sampleIndex + 1}`"
    >
      <template #default="{ errors, inputChanged }">
        <combo-box
          v-model="SAMPLEGROUP"
          :is-disabled="!canEditRow(sample['LOCATION'], editingRow) || sampleGroupInputDisabled"
          :data="sampleGroups"
          text-field="text"
          value-field="value"
          :input-index="sampleIndex"
          :default-text="SAMPLEGROUP"
          class="sample-group-select tw-w-44"
          size="small"
          @create-new-option="createNewSampleGroup"
          @value-changed="inputChanged"
          @input="handleCollectBestNValue(sampleIndex, 'SCREENINGCOLLECTVALUE', 'SAMPLEGROUP', SAMPLEGROUP)"
        />
      </template>
    </extended-validation-provider>

    <tabbed-columns
      class="tw-w-1/2 tw-py-1 tw-border-l tw-border-table-header-background min-height-8 tw-flex tw-h-full"
      :current-editing-row="editingRow"
      :sample="sample"
      :current-tab="currentTab"
      :sample-index="sampleIndex"
      :container-id="containerId"
      v-on="$listeners"
    />

    <div class="actions-column tw-py-1 tw-text-right">
      <span v-if="containerId">
        <span v-if="editingRow === sample['LOCATION']">
          <a
            class="button tw-cursor-pointer  "
            @click="$emit('save-sample', sampleIndex)"
            data-testid="container-save-sample"
          ><i class="fa fa-check" /></a>
          <a
            class="button tw-cursor-pointer tw-mx-1"
            @click="closeSampleEditing"
            data-testid="container-cancel-sample"
          ><i class="fa fa-times" /></a>
        </span>
        <span v-else>
          <a class="button tw-py-1 tw-cursor-pointer tw-mx-1" data-testid="container-move-sample" v-if="sample['BLSAMPLEID'] && !isContainerProcessing" @click="moveSampleToAnotherContainer(sampleIndex)">
            <i class="fa fa-exchange"/>
          </a>
          <a class="button tw-py-1 tw-cursor-pointer tw-mx-1" data-testid="container-edit-sample" @click="editRow(sample)" >
            <i class="fa fa-pencil" />
          </a>
          <router-link v-if="sample['BLSAMPLEID']" class="button tw-py-1 tw-mx-1" data-testid="container-view-sample" :to="`/samples/sid/${sample['BLSAMPLEID']}`" >
            <i class="fa fa-search" />
          </router-link>
          <a class="button tw-cursor-pointer tw-py-1 tw-mx-1" v-if="sample['BLSAMPLEID']" data-testid="container-sample-groups" @click="onAddToSampleGroup">
            <i class="fa fa-cubes" />
          </a>
        </span>
      </span>
      <span v-else>
        <a
          class="button tw-mx-1"
          href=""
          @click.prevent="$emit('clone-sample', sampleIndex)"
          data-testid="add-container-clone-sample"
        ><i class="fa fa-plus" /></a>
        <a
          class="button tw-mx-1"
          href=""
          @click.prevent="$emit('clear-sample', sampleIndex)"
        ><i class="fa fa-times" /></a>
      </span>
    </div>
  </div>
</template>
<script>
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import TabbedColumnsView from 'modules/types/mx/samples/tabbed-columns-view.vue'
import ComboBox from 'app/components/combo-box.vue'
import {ValidationObserver, ValidationProvider} from 'vee-validate'
import MxSampleTableMixin from 'modules/types/mx/samples/sample-table-mixin.js'
import ExtendedValidationProvider from 'app/components/extended-validation-provider.vue'

export default {
  name: 'SampleTableRow',
  components: {
    'extended-validation-provider': ExtendedValidationProvider,
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'tabbed-columns': TabbedColumnsView,
    'combo-box': ComboBox,
    'validation-provider': ValidationProvider,
    'validation-observer': ValidationObserver
  },
  mixins: [MxSampleTableMixin],
  props: {
    sample: {
      type: Object,
      default: () => ({})
    },
    sampleIndex: {
      type: Number,
      default: -1
    },
    requiredColumns: {
      type: Array,
      default: () => ([])
    },
    basicColumns: {
      type: Array,
      default: () => ([])
    },
    extraFieldsColumns: {
      type: Array,
      default: () => ([])
    },
    udcColumns: {
      type: Array,
      default: () => ([])
    },
    currentTab: {
      type: String,
      default: 'basic'
    },
    samplesLength: {
      type: Number,
      default: 1
    },
  },
  methods: {
    onAddToSampleGroup() {
      this.displaySampleGroupModal = true
    },
    moveSampleToAnotherContainer(sampleIndex) {
      this.$emit('open-move-container-form', sampleIndex)
    }
  },
}
</script>
<style scoped>
.location-column {
  width: 30px;
}
.protein-column {
  width: 15%;
}
.name-column {
  width: 10%;
}
.sample-group-column {
  width: 13%;
}
.actions-column {
  width: calc(12% - 30px);
}
.min-height-8 {
  min-height: 32px;
}
:deep() .sample-group-select .items-list, :deep() .protein-select .items-list {
  min-height: 40px;
  max-height: 100px;
  overflow-y: auto;
}
</style>
