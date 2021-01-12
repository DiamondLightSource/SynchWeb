<template>
  <div class="tw-bg-content-background">
    <div id="vue-header" class="tw-flex tw-justify-between tw-items-center tw-h-10 tw-bg-header-background"></div>

    <div class="tw-w-10/12 tw-mx-auto"> <!-- Sets the main width of the content on screen -->
        <h1 class="tw-mt-4 tw-py-4 tw-text-xl">The site is currently undergoing maintenance</h1>
        <p class="tw-mt-4 tw-py-4 tw-text">{{message}}</p>
    </div>
    <footer-panel />
  </div>
</template>


<script>
import Footer from 'js/app/components/footer.vue'

export default {
    name: 'MaintenanceLayout',
    components: {
        'footer-panel': Footer,
    },
    props: [
        'message'
    ],
}
</script>

<style scoped>
/* 
* Unlike the actual header component we don't need to worry about hiding the logo for mobile
* There are no menu buttons to get in the way 
*/
#vue-header {
    @apply tw-bg-header-site-logo;
    background-repeat: no-repeat;
    background-position: center;
}
</style>
