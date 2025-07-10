define(['marionette', 'backbone', 'utils'], function(Marionette, Backbone, utils) {


    var UserItem = Marionette.ItemView.extend({
        template: _.template(''),
        tagName: 'li',
        attributes: { 'data-testid': 'protein-pdb-list-item' },
        events: {
            'click a.delete': 'deletePDB',
            'click a.download': utils.signHandler,
        },

        render: function() {
            UserItem.__super__.render.call(this)
            const linkButton = '<a class="button button-notext" href="https://www.ebi.ac.uk/pdbe/entry/pdb/'+this.model.get('CODE')+'"><i class="fa fa-link"></i> <span>EBI</span></a>'
            const deleteButton = '<a class="button button-notext delete" href="#"><i class="fa fa-times"></i> <span>Delete</span></a>'
            const downloadButton = '<a class="button button-notext download" href="'+app.apiurl+'/sample/pdbs/download/'+this.model.get('PDBID')+'"><i class="fa fa-download"></i> <span>Download</span></a>'
            if (this.model.get('CODE')) {
                this.$el.append(this.model.get('NAME')+' [Code] <span class="r">'+linkButton+' '+deleteButton+'</span>')
            } else {
                this.$el.append(this.model.get('NAME')+' [File] <span class="r">'+downloadButton+' '+deleteButton+'</span>')
            }
        },

        deletePDB: function(e) {
            if (this.options.isLigand) {
                var self = this
                Backbone.ajax({
                    url: app.apiurl+'/sample/pdbs/'+this.model.get('PDBID')+'/lid/'+this.model.get('LIGANDID'),
                    type: 'DELETE',
                    dataType: 'json',
                    success: function(response) {
                        self.model.collection.remove(self.model)
                    }
                })
            } else {
                this.model.destroy()
            }
        },
    })
    
    
    var EmptyUserItem = Marionette.ItemView.extend({
        template: _.template('No PDBs registered to this protein'),
        tagName: 'li',
        attributes: { 'data-testid': 'protein-pdb-no-item' },
    })
    
    return Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'visits clearfix',
        attributes: { 'data-testid': 'protein-pdb-list' },
        childView: UserItem,
        emptyView: EmptyUserItem,
        childViewOptions: function(model) {
            return this.options
        }
    })
    

})
