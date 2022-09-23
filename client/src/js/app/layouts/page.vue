<template>
  <!-- 
        This allows this page to manage its sub-routes 
        The onNavigate is emitted by children to navigate between components
    -->
  <router-view
    :key="$route.fullPath"
    @navigate="onNavigate"
  />
</template>

<script>
export default {
    name: 'PageLayout',

    methods: {
        onNavigate: function(payload) {
            console.log(this.$options.name + " Payload: " + JSON.stringify(payload))
            if (payload) {
                if (payload.name) {
                    this.$router.push(payload)
                } else if (payload.url) {
                    this.$router.push(payload.url)
                } else {
                    console.log(this.$options.name + " Error navigating from sub page. Invalid payload.")
                }
            } else {
                // If no named route simply go back
                this.$router.go(-1)
            }
        }
    }
}
</script>

<style scoped>

</style>