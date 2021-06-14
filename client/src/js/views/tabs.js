define(['marionette',
        'jquery',
        'jquery-ui/ui/widgets/tabs'
      ], function(Marionette, $) {

  /*
    Collection interface to jQuery UI Tabs
   
  */
  var TabItem = Marionette.ItemView.extend({
    tagName: 'li',
    initialize: function(options) {
      var id = this.model.escape(this.getOption('tabID')).replace(/\s+/g, '')
      var title = this.model.get(this.getOption('tabTitle'))
      this.template = _.template('<a href="#tabs-'+id+'">'+title+'</a>')
    }
  })
    
  var TabView = Marionette.CollectionView.extend({
    childView: TabItem,
    tagName: 'ul',
  })
    
  var TabContentItem = Marionette.ItemView.extend({
    template: false,
    initialize: function(options) {
      this.subview = new (_.isFunction(options.tabContentInner) ? options.tabContentInner.call(this) : options.tabContentInner)(options)
    },
      
    onRender: function() {
        this.$el.html(this.subview.render().$el)
        this.$el.attr('id', 'tabs-'+this.model.get(this.options.tabID).replace(/\s+/g, ''))
    },
      
    onShow: function() {
        this.subview.triggerMethod('show');
    },
      
    onDomRefresh: function() {
        this.subview.triggerMethod('domRefresh');
    },
      
    onDestroy: function() {
        this.subview.destroy()
    },
      
  })
        
  var TabContentView = Marionette.CollectionView.extend({
    childView: TabContentItem,
  })
       
       
  return Marionette.LayoutView.extend({
    template: _.template('<div class="tab-container"><section class="tabs"></section><section class="tab-content"></section></div>'),
    regions: { tabs: '.tabs', content: '.tab-content' },
      
    tabContentItem: TabContentItem,
    tabTitle: 'tabName',
    tabID: 'name',
                                      
    initialize: function(options) {
      var cvo = this.getOption('childViewOptions')
      if (_.isFunction(cvo)) cvo = cvo.call(this)
        
      this.tabView = new TabView({
        collection: options.collection,
        childViewOptions: { tabID: options.tabID || this.getOption('tabID'), tabTitle: options.tabTitle || this.getOption('tabTitle') }
      })
        
      this.tabContentView = new TabContentView({
        collection: options.collection,
        childView: TabContentItem,
          
        childViewOptions: $.extend({}, options.childViewOptions, cvo, this.getOption('childViewOptions'), { tabContentInner: (options.tabContentItem || this.getOption('tabContentItem')), tabID: options.tabID || this.getOption('tabID') })
      })
    },
      
    onRender: function() {
      this.tabs.show(this.tabView);
      this.content.show(this.tabContentView);
      this.$el.find('.tab-container').tabs();
    },

  })

})