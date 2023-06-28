<template>
  <div id="vue-logout" class="content">

    <h1>Logout</h1>
    <p class="tw-text-center tw-text-lg tw-mb-2">Successfully logged out. <a :href="logoutUrl">Log out of CAS too?</a></p>
    <a href="/"><p class="tw-text-center tw-text-md">Go to home</p></a>
  </div>
</template>

<script>
import EventBus from "app/components/utils/event-bus.js";

export default {
  name: "Logout",

  computed: {
    logoutUrl: function () {
      return `https://${this.$store.getters.sso_url}/logout`;
    },
  },

  created: function () {
    EventBus.$emit("bcChange", [{ title: "/Logout", url: "/logout" }]);
  },
};
</script>
