<template>
    <span>
  <h1 class="tw-text-center tw-text-lg tw-mb-2">EM views in SynchWeb are no longer supported, and have been superseded by PATo.</h1>
  <a :href="redirectUrl"><h2 class="tw-text-center tw-text-md">Click here to be redirected to the current visit in PATo.</h2></a>
</span>
</template>

<script>

export default {
    'name': 'EmRedirect',
    'props': {
        'collection': {
            'type': Number,
            'required': true,
        },
        'model': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        redirectUrl: function () {
            let redirectLocation = this.$store.state.appOptions.redirects.em;
            const visitStr = this.collection.queryParams.visit;

            if (visitStr) {
                const [proposal, visit] = visitStr.split("-");
                redirectLocation += `/proposals/${proposal}/sessions/${visit}`;
            } else {
                const pathParams = window.location.pathname.split("/");
                const lastParam = pathParams.pop().split("-");

                if(lastParam.length === 2) {
                    redirectLocation += `/proposals/${lastParam[0]}`
                    if(!isNaN(lastParam[1])) {
                        redirectLocation += `/sessions/${lastParam[1]}`;
                    }
                }
            }

            return redirectLocation;
        }
    },
}
</script>
