<template>
    <section id="notauthorised" class="tw-container tw-mx-auto tw-text-center">
        <h1 class="tw-text-2xl tw-mb-2">Not Authorised</h1>
        <p class="tw-mb-2">Sorry, but your login is not authorised for page: <b>{{url}}</b></p>
        <button class="button tw-p-2" @click="$router.push('/')">Return to Home page</button>
        <button v-show="prev" class="button tw-p-2" @click="$router.push(prev)">Return to Previous page</button>
    </section>
</template>

<script>
export default {
    name: 'NotAuthorised',
    props: {
        'url': String,
        'prev': String
    }
}
</script>