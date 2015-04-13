define(['marionette', 
    'modules/mc/collections/intstatuses',
    'modules/dc/collections/autointegrations',

    'modules/dc/views/distl',
    'modules/mc/views/intstatusitem',
    'modules/mc/models/jobstatus',

    'views/pages',
    'views/search',
    'tpl!templates/mc/datacollections.html',
    'tpl!templates/mc/datacollection.html',
    ], function(Marionette, IntegrationStatuses, AutoIntegrations, DISTLView, IntegrationStatusItem, JobStatus, Pages, Search, template, dctemplate) {

    var DCDISTLView = Marionette.ItemView.extend({
        template: dctemplate,
        className: 'dc',
        modelEvents: {
            change: 'setSelected',
        },

        ui: {
            cells: '.cells',
        },

        events: {
            'click .cells': 'sendCell',
        },

        sendCell: function(e) {
            if (!this.aps.length) return
            this.trigger('set:cell', this.aps.at(0))
        },


        onShow: function() {
            var w = 0.175*$(window).width()*0.95
            var h = $(window).width() > 1280 ? w : ($(window).width() > 800 ? w*1.3 : (w*1.65))
            $('.distl', this.$el).height(h*($(window).width() > 800 ? 0.4 : 1.2))

            this.plotview = new DISTLView({ selection: true, parent: this.model, el: this.$el.find('.distl') })
            this.intstatus = new IntegrationStatusItem({ ID: this.model.get('ID'), statuses: this.getOption('intstatuses'), el: this.$el })
            this.aps = new AutoIntegrations(null, { id: this.model.get('ID') })
            this.listenTo(this.aps, 'sync', this.setCell, this)
            this.aps.fetch()

            this.listenTo(this.plotview, 'plot:select', this.setSelection, this)
            this.listenTo(this.plotview, 'plot:deselect', this.setDeselection, this)
        },


        setCell: function() {
            if (this.aps.length) {
                var e = this.aps.at(0)
                var c = e.get('CELL')
                this.ui.cells.html(c['CELL_A']+','+c['CELL_B']+','+c['CELL_C']+','+c['CELL_AL']+','+c['CELL_BE']+','+c['CELL_GA'])
            } else this.ui.cells.html('N/A')
        },


        setSelected: function() {
            if (this.model.get('selected')) this.$el.addClass('selected')
            else this.$el.removeClass('selected')
        },

        setSelection: function(x1, x2) {
            this.model.set('selected', true)
            this.model.set('selection', [x1,x2])
            console.log('sel from distl', x1, x2)
        },

        setDeselection: function(e) {
            this.model.set('selected', false)
            this.model.set('selection', [])  
            console.log('desel from distl')
        },

        onDestroy: function() {
            this.plotview.destroy()
        },
    })

    var DCsDISTLView = Marionette.CollectionView.extend({
        childView: DCDISTLView,

        childViewOptions: function(m) {
            return {
                intstatuses: this.intstatuses,
            }
        },
      
        initialize: function(options) {
          this.intstatuses = new IntegrationStatuses()
        
          this.listenTo(this.collection, 'sync', this._onSync, this)
          this._onSync()
        },
                                                            
        _onSync: function() {
            var ids = this.collection.pluck('ID')
            this.intstatuses.fetch({ data: { ids:  ids }, type: 'POST' })
        },
    })





    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { dcs: '.dcs', srch: '.srch', pages: '.page_wrap' },
    
        events: {
            'click .integrate': 'integrate',
        },

        ui: {
            jobs: '.jobs',
        },

        templateHelpers: function() {
            return {
                VISIT: this.getOption('params').visit
            }
        },


        integrate: function(e) {
            e.preventDefault()
            var s = this.collection.where({ selected: true })

            if (!s.length) {
                utils.confirm({ title: 'No data collections selected', content: 'Please selected some data sets to integrate' })
                return
            }

            var data = { visit: this.getOption('params').visit }
            var integrate = []
            _.each(s, function(s, i) {
                integrate.push([s.get('ID'), s.get('selection')[0], s.get('selection')[1]])
            })

            data.int = integrate
            _.each(['a', 'b', 'c', 'alpha', 'beta', 'gamma', 'res', 'sg'], function(f, i) {
                data[f] = this.$el.find('input[name='+f+']').val().replace(/\s/g, '')
            }, this)

            Backbone.ajax({
                url: app.apiurl+'/mc/integrate',
                data: data,
                type: 'POST',

                success: function() {
                    app.alert({ message: s.length+' job(s) successfully submitted'})
                },

                error: function() {
                    app.alert({ message: 'Something went wrong submitting these jobs, please try again'})
                }
            })
        },


        initialize: function(options) {
            this.paginator = new Pages({ collection: options.collection, noUrl: options.noPageUrl })
            this.search = new Search({ value: options.params.search, collection: options.collection, url: !options.noSearchUrl })

            this.status = new JobStatus()
            this.listenTo(this.status, 'sync', this.setJobs, this)
            this.status.fetch()
        },

        setJobs: function() {
            var n = this.status.get('NUMBER')
            console.log('jobs', n)
            this.ui.jobs.html(n)
            n > 0 ? this.ui.jobs.parent('li').addClass('running') : this.ui.jobs.parent('li').removeClass('running')
        },
                                          
        onRender: function() {
            this.pages.show(this.paginator)
            this.srch.show(this.search)

            var distlview = new DCsDISTLView({ collection: this.collection })
            this.dcs.show(distlview)
            this.listenTo(distlview, 'childview:set:cell', this.setCell, this)
        },
          
        setCell: function(view, ap) {
            console.log('set cell main view', view, ap)
            _.each({'a': 'a', 'b': 'b', 'c': 'c', 'alpha': 'al', 'beta': 'be', 'gamma': 'ga'}, function(k,f) {
                this.$el.find('input[name='+f+']').val(ap.get('CELL')['CELL_'+k.toUpperCase()])
            }, this)

            this.$el.find('input[name=sg]').val(ap.get('SG'))
        },

        onDestroy: function() {
            this.collection.stop()
            this.status.stop()
        },

    })

})