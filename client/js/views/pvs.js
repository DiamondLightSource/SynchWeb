define(['marionette', 'collections/pvs'], function(Marionette, PVs) {

    
    var PVItemView = Marionette.ItemView.extend({
        template: _.template('<h1><%-NAME%></h1><p><%-VALUE%></p>'),
        className: function() {
            return 'pv ' + this.model.get('CLASS')
        },
        
        modelEvents: {
            'change': 'render',
        },
        
    })

    
    return Marionette.CollectionView.extend({
        childView: PVItemView,
        
        initialize: function(options) {
            this.collection = new PVs(null, { bl: options.bl })
            this.collection.fetch()
        },
        
        onDestroy: function() {
            this.collection.stop()
        }
    })
    

})