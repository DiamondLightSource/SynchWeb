// Use this to submit multiple backbone models ONLY
// If you need to submit files, see multimodelfilewrapper.js instead
define(['backbone'], function(Backbone) {
    return Backbone.Model.extend({
        // Allows you to set a submission URL on usage, 
        // just set a urlRoot property to the model like any other data
        urlRoot: function(){return this.get('urlRoot')}
    })
})