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
      this.on('change', this.addDate, this)
      this.addDate()
    },
      
    addDate: function() {
        this.attributes.CREATETIMEISO = new Date(this.get('CREATETIME'))
        this.attributes.MODTIMEISO = new Date(this.get('MODTIME'))
        if (this.get('COMMENTS')) this.attributes.COMMENTSMD = markdown.toHTML(this.get('COMMENTS'))
    }
      
  })
    
})