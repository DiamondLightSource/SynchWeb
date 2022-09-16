<template>
    <div id="footer">
      <div class="whatnow">
          <a href="http://diamondlightsource.github.io/SynchWeb/">SynchWeb? What is This?</a>
      </div>
      <p><a :href="siteLink">{{siteName}}</a> &copy;2013-{{currentYear}}</p>
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
    }
}
</script>

<style scoped>
#footer {
    margin-top: 70px;
    background: #000 url(~images/ispyb_gs_medium.png) center center no-repeat;
    height: 200px;
    background-position: 50% 85%
}

@media (max-width: 1024px) {
    #footer {
        clear: both
    }
}

#footer .whatnow {
    border-top: 1px solid #bbb;
    font-size: 16px;
    font-family: "Maven Pro";
    text-align: center
}

#footer .whatnow a {
    display: block;
    padding: 0.5%;
    color: #222;
    background: #eee;
    transition: 0.3s ease-in-out
}

#footer .whatnow a:hover {
    color: #000
}

#footer a {
    color: #efefef;
    text-decoration: none
}

#footer a:hover {
    color: #efefef
}

#footer p {
    padding: 1%;
    text-align: center;
    color: #efefef;
    font-size: 10px
}


</style>