<!--
    Marionette Dialog Box
-->
<template>
  <!-- This is a placeholder to show dialog boxes from marionette views -->
  <div id="dialog"></div>
</template>

<script>
import MarionetteApplication from 'app/marionette-application.js'
import DialogRegion from 'views/dialogregion'
export default {
  name: 'DialogBox',
  created: function() {
    let application = MarionetteApplication.getInstance()
    application.addRegions({
      dialog: DialogRegion
    })
  },
}
</script>