<template>
  <section class="content">
    <h1>Conexs</h1>
    <p class="help">
      This page allows you to submit conexs jobs to the cluster or wherever else it might be possible to someday
    </p>
    <conexs-submission />
  </section>
</template>

<script>
import ConexsSubmission from 'modules/submission/views/conexs-submission.vue'

export default {
    name: 'ConexsSubmissionWrapper',
    components: {
        'conexs-submission': ConexsSubmission
    },
    props: {

    },

    data: function() {
return {

    };
},

    created: {

    },

    methods: {

    }
}

</script>