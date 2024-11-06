define(['marionette', 'utils'], function(Marionette, utils) {


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
            const linkButton = '<a class="button button-notext" href="https://www.wwpdb.org/pdb?id=pdb_0000'+this.model.get('CODE')+'"><i class="fa fa-link"></i> <span>PDB</span></a>'
            const deleteButton = '<a class="button button-notext delete" href="#"><i class="fa fa-times"></i> <span>Delete</span></a>'
            const downloadButton = '<a class="button button-notext download" href="'+app.apiurl+'/sample/pdbs/download/'+this.model.get('PDBID')+'"><i class="fa fa-download"></i> <span>Download</span></a>'
            if (this.model.get('CODE')) {
                this.$el.append(this.model.get('NAME')+' [Code] <span class="r">'+linkButton+' '+deleteButton+'</span>')
            } else {
                this.$el.append(this.model.get('NAME')+' [File] <span class="r">'+downloadButton+' '+deleteButton+'</span>')
            }
        },

        deletePDB: function(e) {
            this.model.destroy()
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
    })
    

})
