define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'PROPOSAL',
        urlRoot: '/proposal',
        /*urlRoot: '/proposal/prop/',
        url: function() {
            return this.urlRoot + (this.get('PROPOSAL') ? ('?proposal='+this.get('PROPOSAL')) : '')
        }*/
    })
       
})
