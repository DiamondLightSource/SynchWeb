<template>
    <section>
        <h1 class="tw-text-xl">Debug View - Showing Route information</h1>
        <p>Route = {{$route.path}}</p>

        <ul>
            <li v-for="(value, parameter) in $route.params" :key="parameter">
                <p v-show="value">Parameter {{parameter}} = {{value}}</p>
            </li>
        </ul>
    </section>
</template>

<script>

export default {
    name: 'debug',

    created: function() {
        console.log("Debug View Created")
    },
    mounted: function() {
        console.log("Debug View Mounted")
    },
}
</script>