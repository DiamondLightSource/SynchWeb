define(['views/dialog', 'tpl!templates/mc/statstable.html'
    ], function(DialogView, template) {

    return DialogView.extend({
        template: template,
        //title: 'Stats for Blended run',
        
        buttons: {
            'Close': 'closeDialog',
        },

    })

})
