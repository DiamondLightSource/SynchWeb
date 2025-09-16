define(['marionette',
        //'modules/dc/views/imagestatuscollection',
        //'modules/dc/views/apstatuscollection',
        'modules/dc/collections/imagestatuses',
        'modules/dc/collections/apstatuses',
        'modules/dc/collections/apmessagestatuses',

        'modules/dc/views/dc',
        'modules/dc/views/grid',
        'modules/dc/views/load',
        'modules/dc/views/edge',
        'modules/dc/views/mca',
        'modules/dc/views/action',
        ],
function(Marionette, 
         DCImageStatusCollection, DCAPStatusCollection, DCAPMessageStatusCollection,
         DCItemView, GridItemView, RobotItemView, EdgeItemView, MCAItemView, ActionItemView) {
             
  var EmptyCollectionView = Marionette.ItemView.extend({ className: 'data_collection', template: '<div><h1>No data collections yet</h1></div>' })
  var GettingCollectionView = Marionette.ItemView.extend({ className: 'data_collection', template: '<div><h1><i class="fa fa-spin fa-cog"></i> Retrieving data collections</h1></div>' })
  var EmptySearchView = Marionette.ItemView.extend({ className: 'data_collection', template: '<div><h1>No data collections found</h1></div>' })
       
             
  // The main history view
  return Marionette.CollectionView.extend({
    apStatus: true,
    apMessageStatus: true,
    rpStatus: true,
    imageStatusCollection: DCImageStatusCollection,
    apStatusCollection: DCAPStatusCollection,
    apMessageStatusCollection: DCAPMessageStatusCollection,
      
    dcViews: {
        data: DCItemView,
        grid: GridItemView,
        load: RobotItemView,
        mca: MCAItemView,
        edge: EdgeItemView,
        action: ActionItemView
    },
      
    childViewOptions: function(m) {
        var is_vis = !(!this.getOption('params').visit)
        var vl = is_vis ? this.getOption('params').visit : (m ? ((m.get('VIS') ? m.get('VIS') : app.prop+'-'+m.get('VN'))) : '')
        return {
            imagestatuses: this.imagestatuses,
            apstatuses: this.apstatuses,
            apmessagestatuses: this.apmessagestatuses,
            templateHelpers: function() {
              return {
                IS_VISIT: is_vis,
                VIS_LINK: vl,
                APIURL: app.apiurl,
                IS_ARCHIVED: app.options.get('prop_codes_data_deleted').some(code => app.prop.includes(code)) ? "deleted" : "archived",
              }
            },
            visit: vl,
        }
    },
      
    initialize: function(options) {
      this.imagestatuses = new (this.getOption('imageStatusCollection'))()
      this.apstatuses = new (this.getOption('apStatusCollection'))()
      this.apmessagestatuses = new (this.getOption('apMessageStatusCollection'))()
    
      this.listenTo(this.collection, 'sync', this._onSync, this)
      this._onSync()
    },
                                                        
    _onSync: function() {
        var ids = this.collection.pluck('ID')
        this.imagestatuses.fetch({ data: { ids:  ids }, type: 'POST' })
        if (this.getOption('apStatus')) this.apstatuses.fetch({ data: { ids: ids }, type: 'POST' })
        if (this.getOption('apMessageStatus')) this.apmessagestatuses.fetch({ data: { ids: ids }, type: 'POST' })
    },
                                                          
    getChildView: function(item) {
      const ty = item.get('TYPE');
      const collectionType = item.get('DCT');
      const views = this.getOption("dcViews");

      if ("collectionTypeSpecific" in views) {
        if(collectionType in views["collectionTypeSpecific"]) {
          return views["collectionTypeSpecific"][collectionType];
        }
      }

      if (ty in views) {
        return views[ty];
      } 
        
      return views.data
    },
                                                
    getEmptyView: function() {
      if (this.collection.queryParams.s()) return EmptySearchView
      else if (this.collection.fetched) return EmptyCollectionView
      else return GettingCollectionView
    },
                                                          
    onDestroy: function() {
      this.collection.stop()
    },

    onDomRefresh: function() {
      this.children.each(function(v){ v.triggerMethod('dom:refresh') })
    },
  })

       
})
