define(['backbone',
        'views/dialog',
        'collections/shipments',
        'collections/dewars',

        'templates/shipment/movecontainer.html',
    ], function(Backbone, DialogView, Shipments, Dewars, template) {

    return DialogView.extend({
        template: template,
        title: 'Move Container',

        buttons: {
            'Move': 'moveContainer',
            'Cancel': 'closeDialog',
        },

        ui: {
            dewar: 'select[name=dewar]',
            shipment: 'select[name=shipment]',
        },

        events: {
            'change @ui.shipment': 'refreshDewars',
        },

        updateShipments: function() {
            // var opts = this.shipments.map(function(s) { return '<option value="'+s.get('SHIPPINGID')+'">'+s.get('SHIPPINGNAME')+'</option>' })
            // this.ui.shipment.html(opts.join(''))
            this.ui.shipment.html(this.shipments.opts())
            this.refreshDewars()
        },

        refreshDewars: function() {
            if (this.ui.shipment.val()) {
                this.dewars = new Dewars(null, { id: this.ui.shipment.val() , state: { pageSize: 9999 } })
                this.dewars.fetch().done(this.updateDewars.bind(this))
            }
        },

        updateDewars: function() {
            // var opts = this.dewars.map(function(d) { return '<option value="'+d.get('DEWARID')+'">'+d.get('CODE')+'</option>' })
            // this.ui.dewar.html(opts.join(''))
            this.ui.dewar.html(this.dewars.opts())
        },

        moveContainer: function() {
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/shipment/containers/move',
                data: { cid: this.model.get('CONTAINERID'), did: this.ui.dewar.val() },

                success: function() {
                    app.alert({ className: 'message notify', message: 'Container successfully moved' })
                    app.trigger('container:moved')
                    self.closeDialog()
                },
                error: function() {
                    app.alert({ message: 'Something went wrong moving this container, please try again' })
                },
            })
        },


        initialize: function(options) {
            console.log(options.model)
            this.shipments = new Shipments(null, { state: { pageSize: 9999 } })
            this.shipments.fetch().done(this.updateShipments.bind(this))
        },

    })

})