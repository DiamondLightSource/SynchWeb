define(['marionette', 'modules/dc/collections/dccomments',
        'modules/dc/models/dccomment',
        'utils/editable',
        'views/form',
        'tpl!templates/dc/dc_comments.html',
], function(Marionette, DCComments, DCComment, Editable, FormView, template, $) {
       
    var CommentView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<h1><%-GIVENNAME%> <%-FAMILYNAME%><span class="r"><%-CREATETIME%></h1><div class="COMMENTS"><%=COMMENTSMD%></div>'),

        onRender: function() {
            if (this.model.get('PERSONID') == app.personid) {
                var edit = new Editable({ model: this.model, el: this.$el })
                // edit.create('COMMENTS', 'markdown')
            }

        },
    })

    var NoCommentsView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('No comments yet')
    })


    var CommentsView = Marionette.CollectionView.extend({
        childView: CommentView,
        emptyView: NoCommentsView,
        tagName: 'ul',
        className: 'comments',
    })


    return FormView.extend({
        template: template,

        regions: {
            comments: '.comments',
        },

        ui: {
          com: 'textarea[name=COMMENTS]',
        },


        templateHelpers: function() {
            return {
                DC: this.dc.toJSON(),
            }
        },

        createModel: function() {
            this.model = new DCComment({ DATACOLLECTIONID: this.dc.get('ID'), PERSONID: app.personid })
        },

        success: function(response) {
            this.collection.add(this.model)
            this.setupValidation()
            this.ui.com.val('')
            this.dc.set('DCCC', parseInt(this.dc.get('DCCC'))+1)
        },
                                               
        initialize: function(options) {
            this.dc = options.model

            this.collection = new DCComments()
            this.collection.queryParams.id = this.dc.get('ID')
            this.collection.fetch()
        },
    
        onRender: function() {
            this.comments.show(new CommentsView({ collection: this.collection }))
        },


    })
       
})