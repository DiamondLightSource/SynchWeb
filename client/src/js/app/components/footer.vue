<template>
  <div id="footer">
    <div class="bottom_bar">
      <div class="powered_by">
        <p>Powered by <a href="http://diamondlightsource.github.io/SynchWeb/">SynchWeb</a> {{ synchwebVersion }} </p>
      </div>
      <div class="site">
        <p><a :href="siteLink">{{ siteName }}</a> &copy;2013-{{ currentYear }}</p>
      </div>
    </div>

  </div>
</template>

<script>
import config from 'config.json'

export default {
    name: 'Footer',
    data: function() {
      return {
        currentYear: new Date().getFullYear(),
        siteLink: config.site_link || 'https://www.diamond.ac.uk',
        siteName: config.site_name || 'Diamond Light Source'
      }
    },
    computed: {
        synchwebVersion : function() { return this.$store.state.synchwebVersion }
    }
}
</script>

<style scoped>
#footer {
    margin-top: 70px;
    background: #000 url(~images/ispyb_gs_medium.png) center center no-repeat;
    height: 200px;
    background-position: 50% 60%
}

@media (max-width: 1024px) {
    #footer {
        clear: both
    }
}

#footer .bottom_bar {
    border-top: 1px solid #bbb;
    font-size: 12px;
    font-family: "Maven Pro";
    display: block;
    padding: 0.5%;
    color: #222;
    background: #eee;
    transition: 0.3s ease-in-out;
}

#footer .bottom_bar a {
    text-decoration: none;
}

#footer .bottom-bar .powered_by {
    float: left;
    width: 50%;
}

#footer .bottom-bar .site {
    margin-left: 50%;
    text-align: right;
}

</style>
