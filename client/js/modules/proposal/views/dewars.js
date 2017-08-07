define(['marionette', 'collections/dewars'], function(Marionette, Dewars) {

    
    var DewarItem = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<a class="show" href="#"><%-SHIPPINGNAME%></a>: <%-CODE%> <%-FACILITYCODE%> - <%-DEWARSTATUS%>'),
        className: function() {
            return this.model.get('VISITS') == 0 ? 'new' : ''
        },

        events: {
            'click a.show': 'showShipment',
        },

        showShipment: function(e) {
            e.preventDefault()
            app.cookie(this.model.get('PROP'))
            app.trigger('shipment:show', this.model.get('SHIPPINGID'))
        },
    })
    
    var LoadingView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<i class="fa fa-spin fa-spinner"></i>')
    })

    var EmptyView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('No dewars registered yet')
    })
    
    return Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: DewarItem,
        emptyView: LoadingView,
        className: 'visit_users',

        getEmptyView: function(e) {
            if (this.collection.fetched) return EmptyView
            else return LoadingView
        },
        
        initialize: function(options) {
            this.collection = new Dewars()
            this.collection.queryParams.all = 1
            this.collection.queryParams.visit = options.visit
            var self = this
            this.collection.fetch().done(function() {
                self.collection.fetched = true
                self.collection.trigger('reset')
            })
        }
    })
    
       
})