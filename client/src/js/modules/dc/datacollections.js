define(['marionette',
        'views/pages',
    
        'modules/dc/dclist',
        'modules/dc/views/samplechanger',
        'modules/dc/views/dclog',
        'views/status',
        
        'views/search',
        'views/filter',
    
        'modules/stats/views/stack',
    
        'views/dialog',
        'modules/dc/views/queuebuilder',
        'modules/proposal/views/users', 
        'modules/proposal/views/dewars', 

        'modules/dc/views/reprocessoverview',

        'templates/dc/dclist.html',
        ],
function(Marionette, Pages, DCListView,
         SampleChanger, DCLogView, StatusView, Search, Filter, StackView, DialogView, QueueBuilderView, UserView, DewarsView, 
         ReprocessOverview,
         template) {

             
  return Marionette.LayoutView.extend({
    dcListView: DCListView,
    filters: true,
    sampleChanger: true,
      
    className: 'content',
    template: template,
    regions: {
        data_collections: '.data_collections',
        pages: '.page_wrap.one',
        pages2: '.page_wrap.two',
        search: '.srch',
        type: '.type',
        sc: '.sc',
        log: '.lg',
        status: '.st',
        use: '.usage',
    },

    ui: {
        ar: 'input[name=autorefresh]',
    },
      
    events: {
      //'click a.queue': 'showQueueBuilder',
      'mouseover a.users': 'showUsers',
      'mouseout a.users': 'hideUsers',
      'mouseover a.dewars': 'showDewars',
      'mouseout a.dewars': 'hideDewars',
      'click a.refresh': 'refreshDCs',
      'click @ui.ar': 'setAutoRefresh',
      'click a.rpo': 'showReprocess',
    },

    setAutoRefresh: function(e) {
        if (this.ui.ar.is(':checked')) this.collection.run()
        else this.collection.stop()
    },

    refreshDCs: function(e) {
        e.preventDefault()
        this.collection.fetch()
    },


    showDewars: function(e) {
        if (!this.dewars) {
            this.dewars = new DewarsView({ visit: this.model.get('VISIT') })
            this.$el.find('.dewars').append(this.dewars.render().$el)
        }
        this.dewars.$el.show()
    },

    hideDewars: function(e) {
        if (this.dewars) this.dewars.$el.hide()
    },


    showUsers: function(e) {
        console.log('show users')
        e.preventDefault()
        if (!this.users) {
            this.users = new UserView({ visit: this.model.get('VISIT') })
            this.$el.find('.users').append(this.users.render().$el)
        }
        this.users.$el.show()
    },

    hideUsers: function(e) {
        if (this.users) this.users.$el.hide()
    },
      
      
    showQueueBuilder: function(e) {
        if (e) e.preventDefault()
        app.dialog.show(new DialogView({ title: 'Generate GDA Queue', view: new QueueBuilderView({ visit: this.model.get('VISIT'), bl: this.model.get('BL'), dcs: this.collection }), autoSize: 1 }))
        return false
    },

    showReprocess: function(e) {
        if (e) e.preventDefault()
        app.dialog.show(new DialogView({ title: 'Reprocessing', view: new ReprocessOverview({ visit: this.model.get('VISIT') }), autoSize: 1 }))
        return false
    },
    
    templateHelpers: function() {
        return {
            IS_VISIT: !(!this.getOption('params').visit),
            IS_SAMPLE: !(!this.getOption('params').sid),
            IS_SINGLE: !(!this.getOption('params').id),
        }
    },
    
    initialize: function(options) {
        if (this.model && this.model.get('ACTIVE') != "1") {
            var vis = this.getOption('params').visit
            if (vis) {
                if (vis.search('cm') == -1 && vis.search('nt') == -1 && vis.search('nr') == -1) options.collection.stop()
            } else options.collection.stop()
        }

        this.dclist = new (this.getOption('dcListView'))({ collection: options.collection, params: options.params, model: this.model })
        this.paginator = new Pages({ collection: options.collection, noUrl: options.noPageUrl })
        this.paginator2 = new Pages({ collection: options.collection, noUrl: options.noPageUrl })
        this.filter = new Search({ value: options.params.search, collection: options.collection, url: !options.noSearchUrl })
        if (this.getOption('filters')) this.ty = new Filter({ value: options.params.type, collection: options.collection, mobile: true, url: !options.noFilterUrl })
    },
                                      
    onRender: function() {    
        this.data_collections.show(this.dclist)
        this.pages.show(this.paginator)
        this.pages2.show(this.paginator2)
        this.search.show(this.filter)
        if (this.getOption('filters')) this.type.show(this.ty)
        
        if (this.options.params.visit) {
            this.use.show(new StackView({ visit: this.options.params.visit }))
        }
        
        if (this.model && this.model.get('ACTIVE') == 1) {
            // Sample changer
            console.log('get sc', this.getOption('sampleChanger'))
            if (this.getOption('sampleChanger') && this.options.params.visit && !app.mobile()) this.sc.show(new SampleChanger({ visit: this.options.params.visit, dcs: this.collection, bl: this.model.get('BL') }))
          
            // Log View
            this.log.show(new DCLogView({ collection: this.collection }))
          
            // Status Display
                
        }
        
        if (this.model && this.model.get('CAMS') == 1) {
            this.status.show(new StatusView({ bl: this.model.get('BL') }))
        }

        if (app.mobile()) {
            this.$el.find('div.links a').addClass('button-notext')
            this.$el.find('div.links a i').addClass('fa-2x')
        }
    },
      
      
    /*
     Why do we have to do this :(
    */
    onDomRefresh: function() {
      console.log('dom refresh dclist')
      if (this.sc.hasView()) this.sc.currentView.triggerMethod('dom:refresh')
      this.dclist.triggerMethod('dom:refresh')
    },
      
  })
       
})
