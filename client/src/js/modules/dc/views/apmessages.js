define([
    'backbone',
    'marionette',
    'collections/apmessages', 
    'views/tabs',
    'utils'], 
    function(Backbone, Marionette, APMessages, TabView, utils) {

    var icons = {
        ERROR: ['<i class="fa fa-exclamation-circle icon red"></i>', 'serious warning(s)', '<i class="fa fa-times icon red"></i>'],
        WARNING: ['<i class="fa fa-exclamation-triangle icon orange"></i>', 'alert(s)', '<i class="fa fa-exclamation icon orange"></i>'],
        INFO: ['<i class="fa fa-info-circle icon green"></i>', 'check(s) passed', '<i class="fa fa-check icon green"></i>'],
    }


    var SeverityCollection = Backbone.Collection.extend({
        comparator: 'order'
    })

    var ProgramCollection = Backbone.Collection.extend({

    })

    var MessageView = Marionette.ItemView.extend({
        template: _.template('<h3><%=icons[SEVERITY][2]%> <%-MESSAGE%></h3><div class="expand"><pre><%-DESCRIPTION%></pre></div>'),
        templateHelpers: function() {
            return {
                icons: icons,
            }
        },

        ui: {
            expand: '.expand',
        },

        events: {
            'click h3': 'expand',
        },

        tagName: 'li',

        className: function() {
            return this.model.get('SEVERITY')
        },

        expand: function() {
            this.ui.expand.slideToggle()
        },

        onRender: function() {
            this.ui.expand.hide()
        },
    })


    var MessagesView = Marionette.CollectionView.extend({
        childView: MessageView,
        tagName: 'ul',
        className: 'messages',
    })


    var SeverityView = Marionette.LayoutView.extend({
        template: _.template('<h3 class="title"><%=icons[SEVERITY][0]%> <%-count%> <%-icons[SEVERITY][1]%></h3><div class="wrap"></div>'),
        templateHelpers: function() {
            return {
                icons: icons,
                count: this.getOption('messages').where({ SEVERITY: this.model.get('SEVERITY') }).length
            }
        },
        tagName: 'li',
        className: function() {
            return this.model.get('SEVERITY')
        },

        regions: {
            wrap: '.wrap',
        },

        events: {
            'click h3.title': 'expand',
        },

        expand: function() {
            this.wrap.$el.slideToggle()
        },

        onRender: function() {
            var messages = new APMessages(this.getOption('messages').where({ SEVERITY: this.model.get('SEVERITY') }))
            this.wrap.show(new MessagesView({ collection: messages }))
            this.wrap.$el.hide()
        }
    })

    var SeveritiesView = Marionette.CollectionView.extend({
        childView: SeverityView,
        childViewOptions: function() {
            return {
                messages: this.getOption('messages'),
            }
        },
        tagName: 'ul',
        className: 'messages',

        createGroups: function() {
            var order = {
                ERROR: 0,
                WARNING: 1,
                INFO: 2
            }
            var severities = _.map(_.unique(this.getOption('messages').pluck('SEVERITY')), function(s) {
                return { SEVERITY: s, ORDER: order[s] }
            })

            this.collection.reset(severities)
        },

        initialize: function(options) {
            this.collection = new SeverityCollection()
            this.createGroups()
        }
    })


    var ProgramsViewTab = TabView.extend({
        tabTitle: 'PROCESSINGPROGRAMS',
        tabID: 'PROCESSINGPROGRAMS',
        tabContentItem: function() { return ProgramView },
        childViewOptions: function() {
            return {
                messages: this.getOption('messages')
            }
        },

        createGroups: function() {
            var programs = _.map(_.unique(this.getOption('messages').pluck('PROCESSINGPROGRAMS')), function(s) {
                return { PROCESSINGPROGRAMS: s }
            })
            this.collection.reset(programs)
        },

        initialize: function(options) {
            this.collection = options.collection = new ProgramCollection()
            this.createGroups()

            ProgramsViewTab.__super__.initialize.call(this, options)
        },
    })


    var ProgramView = Marionette.LayoutView.extend({
        template: _.template('<div class="wrap"></div>'),
        regions: {
            wrap: '.wrap',
        },

        onRender: function() {
            var messages = new APMessages(this.getOption('messages').where({ PROCESSINGPROGRAMS: this.model.get('PROCESSINGPROGRAMS') }))
            this.wrap.show(new SeveritiesView({ messages: messages }))
        }
    })

    var ProgramsView = Marionette.CollectionView.extend({
        childView: ProgramView,
        childViewOptions: function() {
            return {
                messages: this.getOption('messages'),
            }
        },

        createGroups: function() {
            var severities = _.map(_.unique(this.getOption('messages').pluck('PROCESSINGPROGRAMS')), function(s) {
                return { PROCESSINGPROGRAMS: s }
            })

            this.collection.reset(severities)
        },

        initialize: function(options) {
            this.collection = new ProgramCollection()
            this.createGroups()
        }
    })

    return Marionette.LayoutView.extend({
        template: _.template('<div class="wrapper"></div>'),
        className: 'content',
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
                this.messages.state.pageSize = 9999
                this.ready = this.messages.fetch()
            }
        },

        closeDialog: function() {
            this.trigger('dialog:close')
        },
        

        onRender: function() {
            if (this.getOption('embed')) {
                this.wrap.show(new ProgramsView({ messages: this.messages }))
            } else {
                this.ready.done(this.doOnRender.bind(this))
            }
        },

        doOnRender: function() {
            this.wrap.show(new ProgramsViewTab({ messages: this.messages }))
        },

    })

})