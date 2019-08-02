define(['marionette', 'backbone', 'templates/header.html'], function(Marionette, Backbone, template) {
    
    
    var BreadItemView = Marionette.ItemView.extend({
        getTemplate: function(m) {
            return this.model.get('url') ? _.template('<a href="<%-url%>"><%-title%></a>') : _.template('<%-title%>')
        },
        tagName: 'li',
    })
    
    var BreadCollectionView = Marionette.CollectionView.extend({
        collectionEvents: { 'reset change add remove': 'render' },
        childView: BreadItemView,
        tagName: 'ul',

        onRender: function() {
            this.$el.attr('id', 'navigation')
        },
    })

    return Marionette.LayoutView.extend({
        regions: { bread: '.bread' },
        template: template,
        templateHelpers: function() {
            return {
                IS_STAFF: app.staff,
                PROPOSAL: app.prop,
                APIURL: app.apiurl,
                can: app.user_can
            }
        },
        
        root: null,
        rootLink: null,
        
        events: {
            'click a.pull': 'showMenu',
            'click a.logout': 'logOut',
        },

        logOut: function(e) {
            e.preventDefault()

            sessionStorage.removeItem('token')
            delete app.token

            // Changed to use clearProposal method
            app.clearProposal()
            // sessionStorage.removeItem('prop')
            // delete app.prop

            app.trigger('sidebar:render')

            app.navigate('/');
            this.render()

            if (app.options.get('authentication_type') == 'cas')
                window.location.href='https://'+app.options.get('cas_url')+'/cas/logout'
        },
        
        showMenu: function(e) {
            e.preventDefault()
            $('body').toggleClass('active')
        },
        
        onRender: function() {
            this.$el.find('a.pull').addClass('enable')
            this.bread.show(new BreadCollectionView({ collection: this.bc }))
        },
        
        initialize: function(options) {
            this.bc = options.bc
            this.listenTo(this.bc, 'change add remove reset', this.setTitle.bind(this))
            //app.on('proposal:change', this.setProposal, this)
            this.listenTo(app, 'proposal:change', this.setProposal, this)
        },
        
        // React to proposal change event, handling the case where its cleared (set to null)
        setProposal: function(proposal) {
            if (proposal) {
                this.model = proposal
                console.log('header prop', proposal, proposal.get('MENUS'))
            } else {
                this.model = null
            }
            this.render()
        },
        
        setTitle: function() {
            console.log('set title')
            document.title = 'ISPyB » ' + this.bc.pluck('title').join(' » ')
        },
        
    })
    
})