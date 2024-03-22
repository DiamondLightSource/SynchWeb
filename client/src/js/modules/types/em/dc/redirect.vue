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
    },
    'computed': {
        redirectUrl: function () {
            const visitStr = this.collection.queryParams.visit;
            const [proposal, visit] = visitStr.split("-");
            return `https://ebic-pato.diamond.ac.uk/proposals/${proposal}/sessions/${visit}`
        }
    },
}
</script>
