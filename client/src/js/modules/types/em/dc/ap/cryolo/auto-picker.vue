<template>
  <div class="dcap clearfix">
    <h2>Cryolo Auto Picker</h2>

    <p class="ra">
      <!-- NOT USED ?!?! -->
      <!-- a
        class="dll button"
        :href="dllUrl"
        @click.prevent="showOutput"
      ><i class="fa fa-download" /> Micrograph</a -->
    </p>

    <div
      class="data_collection"
      type="data"
    >
      TODO:
    </div>
  </div>
</template>

<script>
export default {
    'name': "AutoPicker",
    'props': {
        'active' : {
            'type': Boolean,
            'required': true,
        },
        'dataCollectionId': {
            'type': Number,
            'required': true,
        },
    },
}
</script>
