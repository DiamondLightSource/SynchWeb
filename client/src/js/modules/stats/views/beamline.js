define(['marionette',
        'backbone',
        'modules/stats/collections/runs',
        'modules/fault/collections/faults',
        'modules/fault/views/list',
        'modules/stats/models/breakdown',
        'modules/stats/views/breakdown',
    
        'modules/blstats/collections/roboterrors',
        'modules/blstats/views/roboterrors',

        'modules/blstats/models/robotdewar',
        'modules/blstats/views/robotdewar',

        'modules/blstats/models/histogram',
        'modules/blstats/views/histogram',
    
    'templates/stats/beamline.html'], function(Marionette,
        Backbone,
        Runs,
        Faults, FaultListView,
        BreakDown, BreakdownView, 
        RobotErrors, RobotErrorsView, 
        RobotDewar, RobotDewarPlot,
        Histogram, HistgramPlot,
        template) {

    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',
        
        regions: {
            bd: '.breakdown',
            flt: '.faults',
            rbt: '.roboterrors',
            en: '.en',
            rbsx: '.bsx',
            rbsy: '.bsy',
            ex: '.exp'
        },
        
        ui: {
            rbd: '.dewar',
            run: 'select[name=runid]',
            all: 'input[name=all]',
        },

        events: {
            'change @ui.run': 'changeRun',
            'change @ui.all': 'changeRun',
        },

        templateHelpers: function() {
            return {
                BL: this.getOption('bl')
            }
        },

        initialize: function(options) {
            this.breakdown = new BreakDown()

            this.faults = new Faults(null, { queryParams: { bl: options.bl } })
            this.roboterrors = new RobotErrors(null, { queryParams: { bl: options.bl } })

            this.henergy = new Histogram()
            this.bsx = new Histogram()
            this.bsy = new Histogram()
            this.exp = new Histogram()

            this.rdewar = new RobotDewar()

            this.runs = new Runs()
            this.ready = this.runs.fetch()

        },

        popuateRuns: function() {
            this.ui.run.html(this.runs.opts())

            var last
            if (this.getOption('params')) {
                var p = this.getOption('params')
                if (p.run) last = p.run
            } else last = this.runs.first().get('RUNID')

            this.ui.run.val(last)
            this.changeRun()
        },


        changeRun: function() {
            if (!this.first) {
                var url = window.location.pathname.replace(new RegExp('\\/run\\/(\\d)+'), '')+'/run/'+this.ui.run.val()
                window.history.pushState({}, '', url)
            }
            
            this.first = false

            this.ui.run.val()
            this.breakdown.fetch({
                data: {
                    bl: this.getOption('bl'),
                    runid: this.ui.run.val()
                }
            })

            this.henergy.fetch({
                data: {
                    bl: this.ui.all.is(':checked') ? null : this.getOption('bl'),
                    runid: this.ui.run.val()
                }
            })

            this.bsx.fetch({
                data: {
                    bl: this.ui.all.is(':checked') ? null : this.getOption('bl'),
                    runid: this.ui.run.val(),
                    ty: 'beamsizex',
                }
            })

            this.bsy.fetch({
                data: {
                    bl: this.ui.all.is(':checked') ? null : this.getOption('bl'),
                    runid: this.ui.run.val(),
                    ty: 'beamsizey'
                }
            })

            this.exp.fetch({
                data: {
                    bl: this.ui.all.is(':checked') ? null : this.getOption('bl'),
                    runid: this.ui.run.val(),
                    ty: 'exposuretime'
                }
            })

            this.rdewar.fetch({
                data: {
                    bl: this.getOption('bl'),
                    run: this.ui.run.val(),
                }
            })

            this.faults.queryParams.runid = this.ui.run.val()
            this.roboterrors.queryParams.runid = this.ui.run.val()

            this.faults.fetch()
            this.roboterrors.fetch()
        },


        onRender: function() {
            this.first = true
            $.when(this.ready).done(this.popuateRuns.bind(this))
        },

        
        onShow: function() {
            this.bd.show(new BreakdownView({ large: true, model: this.breakdown, params: this.getOption('params') }))
            this.en.show(new HistgramPlot({ collection: new Backbone.Collection([this.henergy]) }))
            this.ex.show(new HistgramPlot({ collection: new Backbone.Collection([this.exp]) }))
            this.rbsx.show(new HistgramPlot({ collection: new Backbone.Collection([this.bsx]) }))
            this.rbsy.show(new HistgramPlot({ collection: new Backbone.Collection([this.bsy]) }))

            this.flt.show(new FaultListView({ collection: this.faults, filters: false, search: false }))
            this.rbt.show(new RobotErrorsView({ collection: this.roboterrors }))
            this.profile = new RobotDewarPlot({ el: this.ui.rbd, model: this.rdewar })
        },
    })

})