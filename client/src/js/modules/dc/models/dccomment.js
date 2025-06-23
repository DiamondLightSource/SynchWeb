define(['backbone', 'markdown'], function(Backbone, markdown) {

  return Backbone.Model.extend({
    idAttribute: 'DATACOLLECTIONCOMMENTID',
    urlRoot: '/dc/comments',
      
    validation: {
        DATACOLLECTIONID: {
            pattern: 'number', 
            required: true,
        },

        PERSONID: {
            required: true,
            pattern: 'number',
        },

        COMMENTS: {
            required: true,
        }
    },


    initialize: function(attrs, options) {
      this.listenTo(this, 'change:CREATETIME change:MODTIME change:COMMENTS', this.addDate)
      this.addDate()
    },
      
    addDate: function() {
        this.set('CREATETIMEISO', new Date(this.get('CREATETIME')))
        this.set('MODTIMEISO', new Date(this.get('MODTIME')))
        if (this.get('COMMENTS')) this.set('COMMENTSMD', markdown.toHTML(this.get('COMMENTS')))
    }
      
  })
    
})
