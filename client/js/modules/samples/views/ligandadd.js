define(['marionette', 'views/form', 'models/ligand', 'tpl!templates/samples/ligandadd.html'], function(Marionette, TableView, Ligand, template) {
    

    return FormView.extend({
        template: template,
        
        createModel: function() {
            this.model = new Ligand()
        },

        success: function(model, response, options) {
            console.log('success from ligadd', this.model)
            app.trigger('ligands:view', model.get('LIGANDID'))
        },

        failure: function(model, response, options) {
            app.alert({ message: 'Something went wrong saving this ligand, please try again' })
        },
    })

})