<!--
Search panel for marionette views
Used by datacollections view to move search and filter widgets to top of screen when on mobile
-->
<template>
  <div class="tw-inline md:tw-hidden">
    <span class="search-mobile">
        <input type="text" class="tw-font-icon search-mobile" :placeholder="icon"/>
    </span>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      icon: '\uf002' // Unicode character for font awesomes magnifying glass
    }
  }
}
</script>


