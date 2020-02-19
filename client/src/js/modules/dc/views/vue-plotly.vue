<template>
    <div>
        <h1>Message = {{msg}}</h1>
        <plotly></plotly>
    </div>
</template>

<script>
    import Plotly from 'plotly.js/dist/plotly'

    export default {
        name: 'PlotlyChart',
        props: {
            msg: String,
            data: {
                type: Object,
                required: false,
            },
            layout: {
                type: Object,
                required: false,
            },
        },
        
        components: {
            'plotly': Plotly,
        },

        // Using props to render the plotly chart
        // created: function(){
        //     this.data = this.$getOption('data')
        // },

        // data: function(){
        //     return {
        //         data: []
        //     }
        // },

        mounted: function(){
            this.doPlot()
        },

        methods: {
            doPlot: function(){
                Plotly.newPlot(this.$el, this.data, this.layout)
            }
        }
    }
</script>