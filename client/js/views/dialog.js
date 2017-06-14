define(['marionette'], function(Marionette) {

    //return DialogView = Marionette.ItemView.extend({
    return DialogView = Marionette.LayoutView.extend({
        template: false,
        
        buttons: {
            'Close': 'closeDialog',
        },
        
        dOptions: {
        },
        
        dialogOptions: function() {
            return _.extend({}, {
                title: this.getOption('title'),
                width: 'auto',
                height: 'auto',
                resizable: false,
                buttons: this.generateButtons(this.getOption('buttons'))
            }, this.getOption('dOptions'))
        },
        
        generateButtons: function(btns) {
            var buttons = {}
            _.each(btns, function(e,l) {
                buttons[l] = this.getOption(e).bind(this)
            }, this)
            
            return buttons
        },
        
        setButtons: function(buttons) {
            app.dialog.dialog('option', 'buttons', this.generateButtons(buttons))
        },
        
        setTitle: function(title) {
            app.dialog.dialog('option', 'title', title)
        },
        
        
        onRender: function() {
            //if (this.getOption('view')) this.getOption('view').$el = this.$el

            if (this.getOption('autoSize')) {
                this.$el.css('width', $(window).width()*(app.mobile() ? 0.8 : 0.5))
                this.$el.css('height', this.$el.width())
            }
            
            if (this.getOption('view')) {
                this.listenTo(this.getOption('view'), 'dialog:close', this.closeDialog)
                this.getOption('view').$el.find('.no_mobile').hide()
                
                if (this.getOption('autoSize')) {
                    this.getOption('view').$el.css('width', this.$el.width())
                    this.getOption('view').$el.css('height', this.$el.width())
                }
            }
            
            if (this.getOption('view')) {   
                //this.getOption('view').render()
            }
        },
        
        onDomRefresh: function() {
            if (this.getOption('view')) {
                this.$el.append(this.getOption('view').render().$el)
                this.getOption('view').triggerMethod('dom:refresh')
            }
            
            this.$el.find('.no_mobile').hide()
        },
        
        onDestroy: function() {
            if (this.getOption('view')) this.getOption('view').destroy()
        },
        
        closeDialog: function(e) {
            if (this.getOption('view')) this.getOption('view').destroy()
            this.trigger('close')
            app.dialog.hideDialog()
            app.dialog.empty()
        },
        
    });

})