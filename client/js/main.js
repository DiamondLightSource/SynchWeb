require.config({
  paths: {
    underscore: 'vendor/underscore.min',
    backbone: 'vendor/backbone/backbone',
    marionette: 'vendor/backbone/backbone.marionette',
    'backbone.paginator': 'vendor/backbone/backbone.paginator',
    'backbone-validation': 'vendor/backbone/backbone-validation',
    backgrid: 'vendor/backbone/backgrid',
    'backgrid-paginator': 'vendor/backbone/backgrid-paginator',
    
    
    'jquery': 'vendor/jquery/jquery-1.9.1.min',
    'jquery.cookie': 'vendor/jquery/jquery.cookie',
    
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
    
    'jquery.mp': 'vendor/jquery/jquery.magnific-popup',
    
    'jquery.editable': 'vendor/jquery/jquery.jeditable.min',
    'jquery.editable.datepicker': 'vendor/jquery/jquery.jeditable.datepicker',
    
    caman: 'vendor/caman.min',
    heatmap: 'vendor/heatmap',
    
    three: 'vendor/Three49custom',
    ms: 'vendor/MarchingSquares',
    gzip: 'vendor/gunzip.min',
    glmol: 'vendor/GLmol',
    
    markdown: 'vendor/markdown',
    
  },
    
  shim: {
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
    

    // jQuery
    'jquery.editable': {
        deps: ['jquery'],
    },
    'jquery.editable.datepicker': {
        deps: ['jquery.editable'],
    },
    
    'jquery.cookie': {
        deps: ['jquery'],
    },
    
    'jquery-ui': {
        deps: ['jquery'],
        //exports: '$.ui'
    },
    
    'jquery-ui.timepicker': {
        deps: ['jquery-ui'],
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
    
    glmol: {
        deps: ['three', 'ms'],
        exports: 'GLmol',
    },
    
    
    markdown: {
        exports: 'markdown',
    },
  },
               
               
  baseUrl: '/client/js',
  //baseUrl: '/client/dist',
});

require(['app'], function(app) {
  "use strict"
  app.start()
})
