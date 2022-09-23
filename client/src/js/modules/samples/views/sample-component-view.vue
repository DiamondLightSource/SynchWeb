<template>
  <div class="tw-w-full tw-flex">
    <base-input-text
      v-if="editable || (editInline && isNewSample)"
      outer-class="tw-px-2 protein-column tw-py-1"
      type="number"
      :label="`${acronym}:`"
      :value="abundance"
      @input="updateProteinAbundance"
    />
    <p v-else>
      {{ abundance }}
    </p>
    <div class="tw-flex tw-items-center">
      <span class="tw-mr-2">{{ concentrationType }}</span>
      <button
        v-if="isNewSample && editInline"
        class="button"
        @click="addComponent"
      >
        <i class="fa fa-check" />
      </button>
      <button
        v-if="editInline || (editInline && isNewSample) || (viewLink && !isNewSample) || editable"
        class="button"
        @click="removeComponent"
      >
        <i class="fa fa-times" />
      </button>
      <router-link
        v-if="viewLink && !isGlobalProtein"
        :to="`/proteins/pid/${proteinId}`"
        class="button"
      >
        <i class="fa fa-search" /> View All
      </router-link>
    </div>
  </div>
</template>

<script>
import BaseInputText from 'app/components/base-input-text.vue'
import { ValidationProvider } from 'vee-validate'
export default {
  name: 'SampleComponentView',
  components: {
    'validation-provider': ValidationProvider,
    'base-input-text': BaseInputText
  },
  props: {
    editable: {
      type: Boolean,
      default: false
    },
    viewLink: {
      type: Boolean,
      default: false
    },
    editInline: {
      type: Boolean,
      default: false
    },
    isNewSample: {
      type: Boolean,
      default: true
    },
    concentrationType: {
      type: String,
      required: true
    },
    acronym: {
      type: String,
      required: true
    },
    isGlobalProtein: {
      type: Boolean,
      default: true
    },
    proteinId: {
      type: Number,
      required: true
    },
    crystalId: {
      type: Number
    },
    abundance: {
      type: Number
    }
  },
  methods: {
    updateProteinAbundance(value) {
      this.$emit('update-protein-abundance', { abundance: value, proteinId: this.proteinId })
    },
    async removeComponent() {
      if (this.editInline && !this.isNewSample) {
        await this.$store.dispatch('deleteDataFromApi', {
          url: `/sample/components/${this.crystalId}-${this.proteinId}`
        })
      }

      this.$emit('remove-sample-components', this.proteinId)
    },
    async addComponent() {
      await this.$store.dispatch('saveDataToApi', {
        url: '/sample/components',
        data: {
          BLSAMPLETYPEID: this.crystalId,
          COMPONENTID: this.proteinId,
          ABUNDANCE: this.abundance
        },
        requestType: 'saving sample components'
      })

      this.$emit('update-sample-component', this.proteinId)
    }
  }
}
</script>

<style scoped>

</style>