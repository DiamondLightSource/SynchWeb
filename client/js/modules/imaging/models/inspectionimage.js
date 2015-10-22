define(['backbone', 'models/wfile'], function(Backbone, File) {
    
    return Backbone.Model.extend(_.extend({}, {
        idAttribute: 'BLSAMPLEIMAGEID',
        urlRoot: '/imaging/inspection/images',

        validation: {
          	CONTAINERINSPECTIONID: {
          		required: true,
          		pattern: 'number',
          	},

          	BLSAMPLEID: {
          		required: true,
          		pattern: 'number',	
          	}
        },

        urlFor: function(ty) {
            return app.apiurl+'/imaging/inspection/image/'+this.get('BLSAMPLEIMAGEID')+(ty ? (ty == 'full' ? '?f=1' : '?f=2') : '')
          
        }
    }, File))
       
})
