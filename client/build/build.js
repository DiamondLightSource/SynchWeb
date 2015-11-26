({
    findNestedDependencies: true,	
    baseUrl: '../js',
    dir: '../dist',
    mainConfigFile: '../js/main.js',
    optimize: 'uglify2',
    preserveLicenseComments: false,
    removeCombined: true,
    modules: [
        {
            name: "main",
            include: ['backbone', 'marionette', 'jquery', 'underscore', 'backgrid', 'backbone.paginator', 'backgrid-paginator',
                
                'views/pages', 'views/filter', 'views/table', 'views/form', 'utils/table',
                
                'modules/types/mx/menu',
                'modules/types/tomo/menu', 
                'modules/types/gen/menu', 
                'modules/types/saxs/menu',
                'modules/types/em/menu',
                
            ],

            exclude: ['json!config.json'],
        },
        {
            name: "modules/dc/controller",
            exclude: ['main'],
        },
        {
            name: "modules/shipment/controller",
            exclude: ['main'],
        },
        {
            name: "modules/samples/controller",
            exclude: ['main'],
        },
        {
            name: "modules/projects/controller",
            exclude: ['main'],
        },
        /*{
            name: "modules/cell/controller",
            exclude: ['main'],
        },*/
        /*{
            name: "modules/calendar/controller",
            exclude: ['main'],
        },*/
        {
            name: "modules/contact/controller",
            exclude: ['main'],
        },
        /*{
            name: "modules/status/controller",
            exclude: ['main'],
        },*/
        /*{
            name: "modules/proposal/controller",
            exclude: ['main'],
        },*/
        /*{
            name: "modules/assign/controller",
            exclude: ['main'],
        },*/
        {
            name: "modules/fault/controller",
            exclude: ['main'],
        },
        {
            name: "modules/stats/controller",
            exclude: ['main'],
        },
        {
            name: "modules/blstats/controller",
            exclude: ['main'],
        },

        {
            name: "modules/mc/controller",
            exclude: ['main'],
        },

        {
            name: "modules/admin/controller",
            exclude: ['main'],
        },

        {
            name: "modules/imaging/controller",
            exclude: ['main'],
        },
    ]    
})
