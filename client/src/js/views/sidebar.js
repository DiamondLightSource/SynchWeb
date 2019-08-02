define(['marionette', 'templates/sidebar.html', 'jquery.cookie'], function(Marionette, template) {
    
    return Marionette.ItemView.extend({
        template: template,
        templateHelpers: function() {
            return {
                PROPOSAL: app.prop
            }
        },
        
        events: {
            'click a': 'hideMenu',
            'click li.help a': 'toggleHelp',
        },
        
        hideMenu: function() {
            $('body').toggleClass('active')
        },
        
        
        initialize: function(options) {
            var c = $.cookie('ispyb_help')
            var help_def = ($(window).width() <= 800) ? 0 : 1
            this.help = c === undefined ? help_def : c
            
            //app.on('proposal:change', this.setProposal, this)
            this.listenTo(app, 'proposal:change', this.setProposal, this)
            this.listenTo(app, 'sidebar:render', this.render, this)
            this.listenTo(app.content, 'show', this.doToggleHelp, this)
        },
        
        onRender: function() {
            this.doToggleHelp()
        },
        
        // React to proposal change event, handling the case where its cleared (set to null)
        setProposal: function(proposal) {
            if (proposal) {
                // console.log('set proposal', proposal.get('MENUS'))
                this.model = proposal
            } else {
                this.model = null
            }
            this.render()
        },
        
        toggleHelp: function(e) {
            e.preventDefault()
            this.help = this.help == 1 ? 0 : 1
            $.cookie('ispyb_help', this.help)
            this.doToggleHelp()
        },
        
        doToggleHelp: function() {
            if (this.help == 1) {
                $('#sidebar ul li.help').addClass('active')
                $('p.help').fadeIn()
                
            } else {
                $('#sidebar ul li.help').removeClass('active')
                $('p.help').fadeOut()
            }
        },
        
    })
    
})
