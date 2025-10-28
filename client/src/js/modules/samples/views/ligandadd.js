define(['marionette', 'views/form', 
    'models/ligand',
    'templates/samples/ligandadd.html'], 
    function(Marionette, TableView, Ligand, template) {
    
    
    return FormView.extend({
        template: template,

        createModel: function() {
            this.model = new Ligand()
        },
        
        success: function(model, response, options) {
            console.log('success from ligand add', this.model)
            app.trigger('ligands:view', model.get('LIGANDID'))
        },

        failure: function(model, xhr, options) {
            console.log(arguments)
            json = null
            if (xhr.responseText) {
                try { 
                    json = $.parseJSON(xhr.responseText)
                } catch(err) {
                    console.error("Error parsing response: ", err)
                }
            }

            if (json.message) app.alert({ message: json.message })
            else app.alert({ message: 'Something went wrong registering that ligand' })
        }
    })

})
