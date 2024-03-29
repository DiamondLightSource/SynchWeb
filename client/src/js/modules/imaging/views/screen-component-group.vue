<template>
  <div>
    <h2>Screen Components</h2>

    <button
      v-if="screenComponents.length > 0 && editable"
      class="button"
      @click="addNewComponent"
    >
      Add Component
    </button>

    <custom-table-component
      class="tw-w-full screen-component-group-table"
      :data-list="formattedScreenComponents"
      :headers="headers"
      no-data-text="No components for this group"
    >
      <template #tableHeaders>
        <td class="tw-w-5/12 tw-py-2 tw-text-center">
          Component
        </td>
        <td class="tw-w-2/12 tw-py-2 tw-text-center">
          Concentration
        </td>
        <td class="tw-w-2/12 tw-py-2 tw-text-center">
          pH
        </td>
        <td class="tw-w-3/12 tw-py-2" />
      </template>
      <template #addNew>
        <tr
          v-if="newComponent.isEditing"
          class="tw-w-full"
        >
          <td class="tw-w-5/12 tw-py-2 tw-text-center">
            <combo-box
              v-model="newComponent.COMPONENTID"
              class="tw-w-48 protein-select tw-mr-2"
              :data="globalProteins"
              text-field="ACRONYM"
              value-field="PROTEINID"
              default-text=""
              size="small"
              :exclude-element-class-list="['custom-add']"
              :can-create-new-item="false"
            >
              <template #default="{ option }">
                <span class="tw-flex tw-justify-between tw-w-full">
                  <span class="tw-"><i
                    v-if="option.SAFETYLEVEL === 'GREEN'"
                    class="fa fa-check green"
                  /></span>
                  {{ option['ACRONYM'] }}
                </span>
              </template>
            </combo-box>
          </td>
          <td class="tw-w-2/12 tw-py-2 tw-text-center ">
            <div class="tw-flex tw-w-full tw-items-center">
              <base-input-text
                v-model="newComponent.CONCENTRATION"
                class="tw-flex-1"
              /> <span class="tw-ml-2">{{ newComponent['UNIT'] }}</span>
            </div>
          </td>
          <td class="tw-w-2/12 tw-py-2 tw-text-center">
            <base-input-text
              v-model="newComponent.PH"
              class="tw-flex-1"
              :disabled="!newComponent.HASPH"
            />
          </td>
          <td class="tw-w-3/12 tw-py-2">
            <div class="tw-w-full tw-flex tw-justify-end tw-items-center">
              <button
                v-if="newComponent.toSave"
                class="button tw-p-2 tw-mr-1"
                @click="saveNewComponent"
              >
                <i class="fa fa-pencil" /> <span>Save</span>
              </button>
              <button
                class="button tw-p-2 tw-ml-1"
                @click="cancelNew"
              >
                <i class="fa fa-times" /> <span>Cancel</span>
              </button>
            </div>
          </td>
        </tr>
      </template>
      <template #slotData="{ dataList }">
        <custom-table-row
          v-for="(result, rowIndex) in dataList"
          :key="rowIndex"
          class="tw-w-full"
          :result="result"
          :row-index="rowIndex"
        >
          <template #default="{ result, rowIndex }">
            <td class="tw-w-5/12 tw-py-2 tw-text-center">
              <combo-box
                v-if="result.isEditing"
                v-model="result.COMPONENTID"
                class="tw-w-48 protein-select tw-mr-2"
                :data="globalProteins"
                text-field="ACRONYM"
                value-field="PROTEINID"
                default-text=""
                size="small"
                :exclude-element-class-list="['custom-add']"
                :can-create-new-item="false"
              >
                <template #default="{ option }">
                  <span class="tw-flex tw-justify-between tw-w-full">
                    <span class="tw-"><i
                      v-if="option.SAFETYLEVEL === 'GREEN'"
                      class="fa fa-check green"
                    /></span>
                    {{ option['ACRONYM'] }}
                  </span>
                </template>
              </combo-box>
              <p v-else>
                {{ result['COMPONENT'] }}
              </p>
            </td>
            <td class="tw-w-2/12 tw-py-2 tw-text-center">
              <div class="tw-flex tw-w-full tw-items-center">
                <base-input-text
                  v-if="result.isEditing"
                  v-model="result.CONCENTRATION"
                  class="tw-flex-1"
                />
                <p v-else>
                  {{ result.CONCENTRATION }}
                </p>
                <span class="tw-ml-2">{{ result.UNIT }}</span>
              </div>
            </td>
            <td class="tw-w-2/12 tw-py-2 tw-text-center">
              <base-input-text
                v-if="result.isEditing && result.HASPH"
                v-model="result.PH"
                class="tw-ml-2 tw-flex-1"
              />
              <p v-else>
                {{ result.PH }}
              </p>
            </td>
            <td class="tw-w-3/12">
              <div
                v-if="editable"
                class="tw-w-full tw-flex tw-justify-end tw-items-center"
              >
                <button
                  class="button tw-mr-1"
                  @click="editRow(rowIndex)"
                >
                  <i class="fa fa-pencil" /> <span>Edit</span>
                </button>
                <button
                  class="button tw-ml-1"
                  @click="deleteRow(rowIndex)"
                >
                  <i class="fa fa-times" /> <span>Delete</span>
                </button>
              </div>
            </td>
          </template>
        </custom-table-row>
      </template>
      <template #noData>
        <custom-table-row class="tw-w-full tw-bg-table-body-background-odd">
          <td
            colspan="5"
            class="tw-text-center tw-py-2"
          >
            No components for this group
          </td>
        </custom-table-row>
      </template>
    </custom-table-component>

    <div
      v-if="canSave && editable"
      class="tw-w-full"
    >
      <button
        class="button"
        @click="$emit('add-component-to-group')"
      >
        <span><i class="fa fa-plus" /> </span> Add Group
      </button>
    </div>
  </div>
</template>

<script>
import BaseInputText from 'app/components/base-input-text.vue'
import BaseTable from 'app/components/table.vue'
import CustomTableComponent from 'app/components/custom-table-component.vue'
import CustomTableRow from 'app/components/custom-table-row.vue'
import { cloneDeep } from 'lodash-es'
import ComboBox from 'app/components/combo-box.vue'

export default {
  name: 'ScreenComponentGroup',
  components: {
    'combo-box': ComboBox,
    'custom-table-row':CustomTableRow,
    'custom-table-component': CustomTableComponent,
    'base-input-text': BaseInputText,
    'base-table': BaseTable
  },
  props: {
    editable: {
      type: Boolean,
      default: false
    },
    canSave: {
      type: Boolean,
      default: false
    },
    globalProteins: {
      type: Array,
      default: () => ([])
    },
    screenComponents: {
      type: Array,
      default: () => ([])
    },
    screenComponentGroup: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      newComponent: {
        SCREENCOMPONENTGROUPID: this.screenComponentGroup['ID'],
        COMPONENTID: '',
        COMPONENT: '',
        UNIT: '',
        HASPH: '',
        PH: '',
        CONCENTRATION: '',
        isEditing: false,
        toSave: false,
        isSaving: false,
      },
      headers: [
        { key: 'COMPONENT', title: 'Component'},
        { key: 'CONCENTRATION', title: 'Concentration'},
        { key: 'UNIT', title: ''},
        { key: 'PH', title: 'pH'},
      ],
      formattedScreenComponents: []
    }
  },
  watch: {
    screenComponents: {
      deep: true,
      immediate: true,
      handler: 'formatScreenComponents'
    },
    'newComponent.COMPONENTID': {
      immediate: true,
      handler: 'populateSelectedComponent'
    },
    screenComponentGroup: {
      deep: true,
      immediate: true,
      handler: 'formatScreenComponents'
    }
  },
  methods: {
    addNewComponent() {
      this.newComponent.isEditing = true
    },
    saveNewComponent() {},
    cancelNew() {
      this.newComponent = {
        COMPONENT: '',
        UNIT: '',
        PH: '',
        CONCENTRATION: '',
        isEditing: false,
      }
    },
    editRow(index) {
      this.$set(this.formattedScreenComponents[index], 'isEditing', true)
    },
    deleteRow(index) {
      this.formattedScreenComponents.splice(index, 1)
    },
    formatScreenComponents() {
      this.formattedScreenComponents = cloneDeep(this.screenComponents)
        .reduce((acc, curr) => {
          if (Number(curr['POSITION']) === Number(this.screenComponentGroup['POSITION'])) {
            const data = {
              ...curr,
              isEditing: false,
              toSave: false,
              isSaving: false,
              toDelete: false,
              isDeleting: false
            }
            acc.push(data)
          }

          return acc
        }, [])
    },
    populateSelectedComponent(newValue) {
      if (newValue) {
        const protein = this.globalProteins.find(protein => +protein['PROTEINID'] === +this.newComponent['COMPONENTID'])

        if (protein) {
          this.newComponent = {
            ...this.newComponent,
            COMPONENT: protein['NAME'] || protein['ACRONYM'],
            UNIT: protein['UNIT'] || protein['CONCENTRATIONTYPE'],
            HASPH: protein['HASPH'],
            POSITION: this.screenComponentGroup['POSITION'],
            toSave: true
          }
        }

      }
    },
  }
}
</script>

<style scoped>
.screen-component-group-table /deep/ tbody tr:nth-child(odd) {
  @apply tw-bg-table-body-background-odd;
}

.screen-component-group-table /deep/ tbody tr:nth-child(even) {
  @apply tw-bg-table-body-background}
</style>