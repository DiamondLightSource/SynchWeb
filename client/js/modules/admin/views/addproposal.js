define(['views/form',
    'models/proposal',

    'tpl!templates/admin/proposaladd.html',
    ], function(FormView, Proposal, template) {

    return FormView.extend({
        template: template,

        ui: {
            pi: 'input[name=PERSONID]',
        },

        createModel: function() {
            this.model = new Proposal()
        },
        
        onRender: function() {
            this.ui.pi.autocomplete({ 
                source: function(req, resp) {
                    Backbone.ajax({
                        url: app.apiurl+'/users',
                        data: {
                            s: req.term,
                        },
                        success: function(data) {
                            resp(_.map(data.data, function(item, i) {
                                return {
                                    label: item.FULLNAME,
                                    value: item.PERSONID,
                                }
                            }))
                        }
                    })
                } 
            })
        },

        success: function(model, response, options) {
            app.trigger('proposal:show', model.get('PROPOSAL'))
        },

        failure: function(model, response, options) {
            app.alert({ message: 'Something went wrong creating this proposal, please try again'})
        },
    })

})