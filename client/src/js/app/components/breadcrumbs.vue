<template>
  <section class="bread">
    <ul id="breadcrumbs" :class="getBackgroundClass">
      <li
        v-for="(item, index) in bc"
        :key="index"
      >
        <router-link
          v-if="item.url"
          :to="item.url"
        >
          {{ item.title }}
        </router-link>
        <span v-else>{{ item.title }}</span>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
    name: 'Breadcrumbs',
    props: {
        'bc': Array // Should be list of objects {'title': ..., 'url': ...}
    },
    watch: {
        // Copy behaviour of original SynchWeb
        // Page title reflects breadcrumbs
        bc: function() {
            var title = this.bc.map( (item) => { return item.title} )
            document.title = 'ISPyB » ' + title.join(' » ')
        }
    },
    computed: {
        isDevMode() {
            return this.$store.state.mode === 'development'
        },
        getBackgroundClass : function() {
            return this.isDevMode ? 'tw-bg-header-background-dev' : 'tw-bg-header-background'
        },
    },
}
</script>

<style scoped>

#breadcrumbs {
    @apply tw-text-header-bc-color;
    @apply tw-p-1;
    @apply tw-text-xxs;
    @apply list-none;
    @apply tw-clear-both
}

#breadcrumbs li {
    /* display: inline;
    padding: 2px */
    @apply tw-inline;
    @apply tw-px-1;
}

#breadcrumbs li a {
    /* color: #dbdbdb;
    text-decoration: none */
    @apply tw-text-header-bc-color;
    @apply tw-no-underline;
}

#breadcrumbs li a:hover {
    @apply tw-text-header-bc-hover;
}

#breadcrumbs li:before {
    content: '\00BB  '
}
</style>
