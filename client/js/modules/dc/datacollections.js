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

        'tpl!templates/dc/dclist.html',
        ],
function(Marionette, Pages, DCListView,
         SampleChanger, DCLogView, StatusView, Search, Filter, StackView, DialogView, QueueBuilderView, UserView, template) {

             
  return Marionette.LayoutView.extend({
    dcListView: DCListView,
    filters: true,
    sampleChanger: true,
      
    className: 'content',
    template: template,
    regions: {
        data_collections: '.data_collections',
        pages: '.page_wrap',
        search: '.srch',
        type: '.type',
        sc: '.sc',
        log: '.lg',
        status: '.st',
        use: '.usage',
    },
      
    events: {
      //'click a.queue': 'showQueueBuilder',
      'mouseover a.users': 'showUsers',
      'mouseout a.users': 'hideUsers',
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
    
    templateHelpers: function() {
        return {
            IS_VISIT: !(!this.getOption('params').visit),
            IS_SAMPLE: !(!this.getOption('params').sid),
            IS_SINGLE: !(!this.getOption('params').id),
        }
    },
    
    initialize: function(options) {
        this.dclist = new (this.getOption('dcListView'))({ collection: options.collection, params: options.params, model: this.model })
        this.paginator = new Pages({ collection: options.collection, noUrl: options.noPageUrl })
        this.filter = new Search({ value: options.params.search, collection: options.collection, url: !options.noSearchUrl })
        if (this.getOption('filters')) this.ty = new Filter({ value: options.params.type, collection: options.collection, mobile: true, url: !options.noFilterUrl })
    },
                                      
    onRender: function() {    
        this.data_collections.show(this.dclist)
        this.pages.show(this.paginator)
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
    },
      
  })
       
})
