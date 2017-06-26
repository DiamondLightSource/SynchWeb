define(['marionette',
        'modules/fault/collections/faults',
        'modules/fault/views/list',
        'modules/stats/views/breakdown',
        'modules/stats/views/details',
        'modules/stats/views/pie',
        'modules/stats/views/hourlies',
        'modules/stats/views/ehc',
        'modules/stats/views/callout',
    
        'modules/blstats/collections/roboterrors',
        'modules/blstats/views/roboterrors',
        'modules/blstats/views/robotdewar',
    
    'tpl!templates/stats/visit.html'], function(Marionette, Faults, FaultListView,
        BreakdownView, DetailsView, PieView, HourliesView, EHCLogView, CalloutView,
        RobotErrors, RobotErrorsView, RobotDewarPlot,
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
            rbt: '.roboterrors',
        },
        
        ui: {
            rbd: '.dewar',
        },
        
        onShow: function() {
            this.bd.show(new BreakdownView({ model: this.getOption('breakdown'), params: this.getOption('params') }))
            this.det.show(new DetailsView({ model: this.getOption('breakdown') }))
            this.hrs.show(new HourliesView({ visit: this.model.get('VISIT') }))
            if (app.staff) this.call.show(new EHCLogView({ visit: this.model.get('VISIT') }))
            if (app.staff) this.ehc.show(new CalloutView({ visit: this.model.get('VISIT') }))
            
            this.pie = new PieView({ visit: this.model.get('VISIT'), el: this.$el.find('#visit_pie') })
            
            this.faults = new Faults(null, { queryParams: { visit: this.model.get('VISIT') } })
            this.faults.fetch()
            
            this.flt.show(new FaultListView({ collection: this.faults, filters: false, search: false }))
            
            this.roboterrors = new RobotErrors(null, { queryParams: { visit: this.model.get('VISIT') } })
            this.roboterrors.fetch()
            
            this.rbt.show(new RobotErrorsView({ collection: this.roboterrors }))
            this.profile = new RobotDewarPlot({ el: this.ui.rbd, visit: this.model.get('VISIT') })
        },
    })

})