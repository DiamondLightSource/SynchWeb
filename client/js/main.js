require.config({
  paths: {
    underscore: 'vendor/underscore.min',
    backbone: 'vendor/backbone/backbone',
    marionette: 'vendor/backbone/backbone.marionette',
    'backbone.paginator': 'vendor/backbone/backbone.paginator',
    'backbone-validation': 'vendor/backbone/backbone-validation',
    backgrid: 'vendor/backbone/backgrid',
    'backgrid-paginator': 'vendor/backbone/backgrid-paginator',
    'backgrid-select-all': 'vendor/backbone/backgrid-select-all',
    
    
    'jquery': 'vendor/jquery/jquery-1.9.1.min',
    'jquery.cookie': 'vendor/jquery/jquery.cookie',
    'jquery.touchswipe': 'vendor/jquery/jquery.touchSwipe',
    
    'jquery-ui': 'vendor/jquery/jquery-ui.min',
    'jquery-ui.combobox': 'vendor/jquery/jquery-ui.combobox',
    'jquery-ui.timepicker': 'vendor/jquery/jquery-ui.timepicker-addon',
    
    'jquery.flot': 'vendor/flot/jquery.flot.min',
    'jquery.flot.resize': 'vendor/flot/jquery.flot.resize',
    'jquery.flot.pie': 'vendor/flot/jquery.flot.pie',
    'jquery.flot.time': 'vendor/flot/jquery.flot.time.min',
    'jquery.flot.selection': 'vendor/flot/jquery.flot.selection',
    'jquery.flot.stack': 'vendor/flot/jquery.flot.stack',
    'jquery.flot.tickrotor': 'vendor/flot/jquery.flot.tickrotor',
    'jquery.flot.tooltip': 'vendor/flot/jquery.flot.tooltip',
    'jquery.flot.axislabels': 'vendor/flot/jquery.flot.axislabels',
    
    'jquery.mp': 'vendor/jquery/jquery.magnific-popup',
    
    'jquery.editable': 'vendor/jquery/jquery.jeditable.min',
    'jquery.editable.datepicker': 'vendor/jquery/jquery.jeditable.datepicker',

    'jquery.color': 'vendor/jquery/jquery.color',
    
    caman: 'vendor/caman.min',
    heatmap: 'vendor/hmap',
    
    // three: 'vendor/Three49custom',
    // ms: 'vendor/MarchingSquares',
    gzip: 'vendor/gunzip.min',
    // glmol: 'vendor/GLmol',
    
    markdown: 'vendor/markdown',

    three: 'vendor/three.min',
    uglymol: 'vendor/uglymol',

    moment: 'vendor/moment',

    highmaps: 'vendor/highmaps/highmaps',
    'highmaps-world': 'vendor/highmaps/world',

    // Vue library (v2.6.9)
    vue: 'vendor/vue/vue.min',
    // Vee-validate library (v2.2.0)
    veevalidate: 'vendor/vue/vee-validate.min',
    // IE needs a promise polyfill for vue validation library
    promise: 'vendor/vue/polyfill.min',
  },
    
  shim: {
    config: {
        exports: 'config',
    },

    underscore: {
        exports: '_'
    },
    
    
    caman:  {
        deps: ['jquery'],
        exports: 'Caman'
    },
    
    //Backbone  + plugins
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

    /*'backbone-validation': {
      exports: 'Backbone.Validation',
        deps: ['backbone']
    },*/
    
    backgrid: {
      exports: 'Backgrid',
        deps: ['backbone']
    },

    'backgrid-paginator': {
      exports: 'Backgrid.Extension.Paginator',
        deps: ['backgrid']
    },

    'backgrid-select-all': {
      // exports: 'Backgrid.Extension.SelectCell',
        deps: ['backgrid']
    },
    

    // jQuery
    'jquery.color': {
        deps: ['jquery'],
    },
    
    'jquery.editable': {
        deps: ['jquery'],
    },
    
    'jquery.cookie': {
        deps: ['jquery'],
    },

    'jquery.touchswipe': {
        deps: ['jquery']
    },
    
    'jquery-ui': {
        deps: ['jquery'],
        //exports: '$.ui'
    },
    
    'jquery-ui.timepicker': {
        deps: ['jquery-ui'],
    },

    'jquery.editable.datepicker': {
        deps: ['jquery.editable'],
    },

    'jquery-ui.combobox': {
        deps: ['jquery-ui']
    },
    
    
    // Flot
    'jquery.flot': {
      deps: ['jquery'],
      exports: '$.plot'
    },
    'jquery.flot.selection': {
      deps: ['jquery.flot']
    },
    'jquery.flot.resize': {
      deps: ['jquery.flot']
    },
    'jquery.flot.pie': {
      deps: ['jquery.flot']
    },
    'jquery.flot.time': {
      deps: ['jquery.flot']
    },
    'jquery.flot.stack': {
      deps: ['jquery.flot']
    },
    'jquery.flot.tooltip': {
        deps: ['jquery.flot']
    },
    'jquery.flot.tickrotor': {
        deps: ['jquery.flot']
    },
    'jquery.flot.axislabels': {
        deps: ['jquery.flot']
    },
    
    
    // WebGL / GLmol Dependencies
    three: {
        exports: 'THREE',
    },
    
    ms: {
        deps:['three'],
        exports: 'THREE.MarchingCubes',
    },
    
    gzip: {
        exports: 'Zlib',
    },
    
    // glmol: {
    //     deps: ['three', 'ms'],
    //     exports: 'GLmol',
    // },
    
    
    markdown: {
        exports: 'markdown',
    },


    highmaps: {
        deps: ['jquery'],
        exports: 'Highcharts'
    },

    'highmaps-world': {
        deps: ['highmaps'],
    },
    
  },
});

require(['app'], function(app) {
  "use strict"
  app.start()
})
