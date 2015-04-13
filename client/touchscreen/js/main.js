require.config({
    paths: {
        underscore: 'vendor/underscore.min',
        backbone: 'vendor/backbone/backbone',
        marionette: 'vendor/backbone/backbone.marionette',
        'backbone.paginator': 'vendor/backbone/backbone.paginator',

        'jquery': 'vendor/jquery/jquery-1.9.1.min',
        'jquery.mobile': 'vendor/jquery/jquery.mobile-1.4.5'
    },
    
    shim: {
        underscore: {
            exports: '_'
        },

        backbone: {
          exports: 'Backbone',
            deps: ['jquery', 'underscore']
        },
        marionette: {
          exports: 'Backbone.Marionette',
            deps: ['backbone']
        },
        'backbone.paginator': {
          exports: 'Backbone.PagableCollection',
            deps: ['backbone']
        },
    
    },
               
               
    baseUrl: 'js',
});

require(['jquery'], function() {
    
    $( document ).on( "mobileinit", function() {
        $.mobile.ajaxEnabled = false;
        $.mobile.linkBindingEnabled = false;
        $.mobile.hashListeningEnabled = false;
        $.mobile.pushStateEnabled = false;
        
        console.log('mobile init')
    })

    require(['app'], function(app) {
        "use strict"
        app.start()
    })

})