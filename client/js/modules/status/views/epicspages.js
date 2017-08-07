define(['marionette',
    'views/dialog',
    'modules/status/collections/epicspages',
    'modules/status/views/motors',
    ], function(Marionette, DialogView, EpicsPages, MotorsView) {
    

    var EPButton = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<a href="#" class="button"><%-NAME%></a>'),
        
        events: {
            'click a.button': 'showMotors',
        },
        
        showMotors: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: 'EPICS '+this.model.get('NAME'), view: new MotorsView({ epid: this.model.get('ID'), bl: this.getOption('bl') }), autoSize: 1 }))
        },
    })
    
    return Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: EPButton,
        childViewOptions: function() {
            return {
                bl: this.getOption('bl')
            }
        },
        
        initialize: function(options) {
            this.collection = new EpicsPages(null, { bl: this.getOption('bl') })
            this.collection.fetch()
        },
    })
        
})