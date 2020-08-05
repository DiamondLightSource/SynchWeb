<template>
    <div>
        <plotly></plotly>
    </div>
</template>

<script>
    import Plotly from 'utils/plotly-loader'

    export default {
        name: 'PlotlyChart',
        props: {
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