define(['marionette', 'backbone', 'tpl!templates/header.html'], function(Marionette, Backbone, template) {
    
    
    var BreadItemView = Marionette.ItemView.extend({
        getTemplate: function(m) {
            return this.model.get('url') ? _.template('<a href="<%=url%>"><%=title%></a>') : _.template('<%=title%>')
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
            }
        },
        
        root: null,
        rootLink: null,
        
        events: {
            'click a.pull': 'showMenu',
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
        
        setProposal: function(proposal) {
            this.model = proposal
            console.log('header prop', proposal, proposal.get('MENUS'))
            this.render()
        },
        
        setTitle: function() {
            console.log('set title')
            document.title = 'ISPyB » ' + this.bc.pluck('title').join(' » ')
        },
        
    })
    
})