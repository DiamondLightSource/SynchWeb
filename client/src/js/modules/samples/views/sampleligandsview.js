define(['marionette', 'backbone'], function(Marionette, Backbone) {

    var LigandView = Marionette.ItemView.extend({
        tagName: 'li',
        getTemplate: function() {
            return _.template('<%-NAME%> <a href="#" class="delete button"><i class="fa fa-times"></i></a>')
        },

        events: {
            'click a.delete': 'removeLigand',
        },

        addLig: function(e) {
            Backbone.ajax({
                url: app.apiurl+'/sample/ligands/add',
                type: 'POST',
                data: {
                    sid: this.getOption('BLSAMPLEID'),
                    lid: this.model.get('LIGANDID'),
                },
                success: this.ligAdded.bind(this)
            })
        },

        ligAdded: function(response) {
            this.model.set('new', false)
            this.render()
        },

        removeLigand: function(e) {
            e.preventDefault()

            var self = this
            Backbone.ajax({
                url: app.apiurl+'/sample/ligands/'+this.getOption('BLSAMPLEID')+'/lid/'+this.model.get('LIGANDID'),
                type: 'DELETE',
                dataType: 'json',
                success: function(response) {
                    self.model.collection.remove(self.model)
                }
            })

        },

        initialize: function(options) {
            Backbone.Validation.bind(this)
            
            if (this.model.get('new')) {
                this.addLig()
            }
        },

    })

    var EmptyView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('No Ligands')
    })

    return LigandsView = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: LigandView,
        className: 'visits',

        getEmptyView: function() {
            return this.getOption('showEmpty') ? EmptyView : null
        },

        childViewOptions: function() {
            return {
                BLSAMPLEID: this.getOption('BLSAMPLEID'),
            }
        },
    })


})
