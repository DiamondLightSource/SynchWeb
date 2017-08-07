define(['marionette',
    ], function(Marionette) {
    
        
    var TutorialListItem = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<%-title%>'),
        
        modelEvents: {
            'change': 'render',
        },
        
        onRender: function() {
            this.model.get('isSelected') ? this.$el.addClass('current') : this.$el.removeClass('current')
        },
        
        events: {
            'click': 'setSelected',
        },
        
        setSelected: function() {
            this.model.set({ isSelected: true })
        },
        
    })
        
    var TutorialList = Marionette.CollectionView.extend({
        childView: TutorialListItem,
        tagName: 'ul',
    })
    
        
    var TutorialCollection = Backbone.Collection.extend({
        pages: ['proposal', 'contact', 'shipment', 'samples', 'prepare', 'data', 'mobile'],
        titles: ['Select Proposal', 'Register Contact', 'Create Shipment', 'Register Samples', 'Prepare Experiment', 'View Your Data', 'Mobile Access'],
        
        initialize: function(models, options) {
            var col = []
            _.each(this.titles, function(t,i) {
                col.push({ id: i, title: t, page: this.pages[i] })
            }, this)
            this.reset(col)
            
            this.on('change:isSelected', this.onSelectedChanged, this);
        },
        
        onSelectedChanged: function(model) {
            this.each(function(model) {
                if (model.get('isSelected') === true && !model._changing) {
                    model.set({isSelected: false})
                }
            })
            console.log('trigger selected change')
            this.trigger('selected:change')
        },
        
        
    })
        
        
    var TutorialItem = Marionette.ItemView.extend({
        className: 'content',
        template: _.template('<%-content%>'),
        
        templateHelpers: function() {
            return {
                content: this.content
            }
        },
        
        modelEvents: {
            'sync': 'render',
        },
        
        initialize: function(options) {
            this.listenTo(this.collection, 'selected:change', this.loadTutorial, this)
            
        },
        
        loadTutorial: function() {
            var sel = this.collection.findWhere({ isSelected: true })
            if (sel) {
                var self = this
                $.get('/doc/'+sel.get('page')+'/index.html', function(resp) {
                    self.content = resp
                    self.render()
                })
            }
        },
    })
        
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Tutorials</h1><div class="filter clearfix"></div><div class="cnt"></div>'),
        
        regions: {
            menu: '.filter',
            cnt: '.cnt',
        },
        

        initialize: function(options) {
            this.tutorials = new TutorialCollection()
        },
        
        onRender: function() {
            this.menu.show(new TutorialList({ collection: this.tutorials }))
            this.cnt.show(new TutorialItem({ collection: this.tutorials }))
            this.tutorials.at(0).set({ isSelected: true })
        },
        
    })
        
})