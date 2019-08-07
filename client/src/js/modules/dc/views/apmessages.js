define(['marionette',
    'collections/apmessages', 
    'utils'], 
    function(Marionette, APMessages, utils) {


    var MessageView = Marionette.ItemView.extend({
        tagName: 'li',
        getTemplate: function() {
            if (this.getOption('embed')) {
                return _.template('<h2><%=icon%> <%-MESSAGE%></h2><p><%-DESCRIPTION%></p>')
            } else {
                return _.template('<h1><%=icon%> <%-MESSAGE%></h1><h2><%-PROCESSINGPROGRAMS%>: <%-RECORDTIMESTAMP%></h2><p><%-DESCRIPTION%></p>')
            }
        },
        className: function() {
            return this.model.get('SEVERITY')
        },

        initialize: function() {
            var icons = {
                ERROR: '<i class="fa fa-exclamation-circle icon red"></i>',
                WARNING: '<i class="fa fa-exclamation-triangle icon orange"></i>',
                INFO: '<i class="fa fa-info-circle icon green"></i>',
            }

            this.model.set('icon', icons[this.model.get('SEVERITY')])
        },
    })


    var MessagesView = Marionette.CollectionView.extend({
        childView: MessageView,
        tagName: 'ul',
        className: 'messages',
        childViewOptions: function() {
            return {
                embed: this.getOption('embed')
            }
        }
    })


    return Marionette.LayoutView.extend({
        className: 'content',
        getTemplate: function() {
            if (this.getOption('embed')) {
                return _.template('<div class="wrapper"></div>')
            } else {
                return _.template('<h1>Processing Messages</h1><p class="help">This page lists all procesing messages for the selected datacollection</p><div class="wrapper"></div>')
            }
        },
        regions: { 
            wrap: '.wrapper' 
        },
    

        initialize: function(options) {
            if (options && options.messages) {
                this.messages = options.messages

            } else {
                this.messages = new APMessages()

                this.messages.queryParams.id = this.getOption('id')
                this.messages.queryParams.dcg = this.getOption('dcg')
                this.messages.fetch()
            }
        },

        closeDialog: function() {
            this.trigger('dialog:close')
        },
        

        onRender: function() {
            this.wrap.show(new MessagesView({ collection: this.messages, embed: this.getOption('embed') }))
        },

    })
})