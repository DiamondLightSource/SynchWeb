define(['marionette',
    'jquery',
    'jquery-ui/ui/widgets/dialog'
    ], function(Marionette) {
    
    return Marionette.Region.extend({
        el: '#dialog',
        constructor: function () {
            Marionette.Region.prototype.constructor.apply(this, arguments);
            this.on("show", this.showDialog, this);
        },
        
        getEl: function (selector) {
            var $el = $(selector);
            return $el;
        },
        
        showDialog: function (view) {
            view.on("close", this.hideModal, this);
            this.$el.dialog(_.isFunction(view.dialogOptions) ? view.dialogOptions.call(view) : view.dialogOptions);
            this.$el.dialog('open');
        },
        
        hideDialog: function () {
            this.$el.dialog('close');
        },
        
        dialog: function() {
            console.log('dargs', arguments)
            this.$el.dialog.apply(this.$el, arguments)
        }
        
    });

})