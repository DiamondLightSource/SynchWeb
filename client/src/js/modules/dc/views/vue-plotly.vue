<template>
    <div>
        <plotly></plotly>
    </div>
</template>

<script>
    import Plotly from 'plotly.js/dist/plotly'

    export default {
        name: 'PlotlyChart',
        
        components: {
            'plotly': Plotly,
        },

        created: function(){
            this.data = this.$getOption('data')
        },

        data: function(){
            return {
                data: [] 
            }
        },

        mounted: function(){
            this.doPlot()
        },

        methods: {
            doPlot: function(){
                Plotly.newPlot(this.$el, this.data.data, this.data.layout)
            }
        }
    }
</script>