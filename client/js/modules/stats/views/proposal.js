define(['marionette',
        'modules/stats/views/pies',
        'modules/stats/views/hourlies',
    
        'modules/stats/models/pie',
        'modules/stats/views/pie',
    
    'tpl!templates/stats/proposal.html'
    ], function(Marionette,
        PiesView, HourliesView,
        Pie, PieView,
        template) {


    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',
        
        regions: {
            ps: '.pies',
            hrs: '.hrs',
        },

        initialize: function(options) {
        },
        
        onShow: function() {
            this.ps.show(new PiesView({ collection: this.getOption('pies') }))
            this.hrs.show(new HourliesView())
            
            var average = new Pie({ data: this.getOption('pies').average })
            this.pie = new PieView({ model: average, el: this.$el.find('#visit_pie') }).render()
        },
        
    })
    

})