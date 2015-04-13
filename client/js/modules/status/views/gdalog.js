define(['marionette',
    'modules/status/collections/gda',

    ], function(Marionette, GDALog) {
    
    var LogEntry = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<%=LINE%>'),
        
        modelEvents: {
            'change': 'render',
        },
        
        onRender: function() {
        },
    })
        
        
    return Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: LogEntry,
        
        initialize: function(options) {
            this.collection = new GDALog(null, { bl: this.getOption('bl') })
            
            var self = this
            this.collection.fetch().done(function() { console.log(self.collection) })
        },
        
        onDestroy: function() {
            this.collection.stop()
        },
    })
        
})