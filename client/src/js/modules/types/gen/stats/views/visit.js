define(['marionette',
        'modules/fault/collections/faults',
        'modules/fault/views/list',
        'modules/stats/views/breakdown',
        'modules/stats/views/details',
        'modules/stats/views/pie',
        'modules/stats/views/hourlies',
        'modules/stats/views/ehc',
        'modules/stats/views/callout',
    
        'templates/types/gen/stats/visit.html'], function(Marionette, Faults, FaultListView,
        BreakdownView, DetailsView, PieView, HourliesView, EHCLogView, CalloutView,
        template) {

    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',
        
        regions: {
            bd: '.breakdown',
            det: '.details',
            call: '.callouts',
            ehc: '.ehclogs',
            hrs: '.hrs',
            flt: '.faults',
        },
        
        
        onShow: function() {
            this.bd.show(new BreakdownView({ model: this.getOption('breakdown') }))
            this.det.show(new DetailsView({ model: this.getOption('breakdown') }))
            //this.hrs.show(new HourliesView({ visit: this.model.get('VISIT') }))
            if (app.staff) this.call.show(new EHCLogView({ visit: this.model.get('VISIT') }))
            if (app.staff) this.ehc.show(new CalloutView({ visit: this.model.get('VISIT') }))
            
            this.pie = new PieView({ visit: this.model.get('VISIT'), el: this.$el.find('#visit_pie') })
            
            this.faults = new Faults(null, { queryParams: { visit: this.model.get('VISIT') } })
            this.faults.fetch()
            
            this.flt.show(new FaultListView({ collection: this.faults, filters: false, search: false }))
        },
    })

})