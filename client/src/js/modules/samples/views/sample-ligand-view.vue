<template>
  <div class="tw-w-full tw-flex">
    <p>
      {{ name }}
    </p>
    <div class="tw-flex tw-items-center">
      <button
        class="button"
        @click="removeLigand"
      >
        <i class="fa fa-times" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SampleLigandView',
  props: {
    name: {
      type: String,
      required: true
    },
    ligandId: {
      type: Number,
      required: true
    }
  },
  methods: {
    async removeLigand() {
      this.$emit('remove-sample-ligands', this.ligandId)
    },
  }
}
</script>
