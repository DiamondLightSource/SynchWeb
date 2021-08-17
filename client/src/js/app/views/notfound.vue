<template>
    <section id="notfound" class="tw-container tw-mx-auto tw-text-center">
        <h1 class="tw-text-2xl tw-mb-2">Not found</h1>
        <p class="tw-mb-2">Sorry but the page you requested: <b>{{url}}</b> did not match a route</p>
        <button class="button tw-p-2" @click="$router.push('/')">Return to Home page</button>
        <button v-show="prev" class="button tw-p-2" @click="$router.push(prev)">Return to Previous page</button>
    </section>
</template>

<script>
export default {
    name: 'NotFound',
    props: {
        'url': String,
        'prev': String
    }
}
</script>