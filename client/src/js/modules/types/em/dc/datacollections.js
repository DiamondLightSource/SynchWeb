define([
    'modules/types/gen/dc/datacollections',
    'modules/types/gen/dc/dclist',
    'modules/types/em/dc/dc',
    'modules/types/em/collections/apstatuses',

    'modules/stats/models/breakdown',
    'modules/stats/views/breakdown',

    'templates/types/em/dc/dclist.html',
    ],
function(DataCollections, DCList, DCItemView, EMAPStatuses, 
    BreakDown, BreakdownView,
    template) {
    
    var EMDCList = DCList.extend({
        apStatusCollection: EMAPStatuses,
        dcViews: {
            data: DCItemView,
        },
        apStatus: true,
    })
    
    var EMDataCollections = DataCollections.extend({
        dcListView: EMDCList,
        template: template,

        // fix me
        regions: {
            data_collections: '.data_collections',
            pages: '.page_wrap.one',
            pages2: '.page_wrap.two',
            search: '.srch',
            type: '.type',
            sc: '.sc',
            log: '.lg',
            status: '.st',
            use: '.usage',
            rbd: '.breakdown'
        },

        initialize: function(options) {
            EMDataCollections.__super__.initialize.call(this, options)
            this.breakdown = new BreakDown({ visit: this.options.params.visit })
            this.listenTo(this.breakdown, 'sync', this.queueRefresh)
            this.breakdown.fetch()
        },

        queueRefresh: function() {
            if (this.model && this.model.get('ACTIVE') == 1) {
                setTimeout(this.breakdown.fetch.bind(this.breakdown), 10000)
            }
        },

        onShow: function() {
            // EMDataCollections.__super__.onShow.call(this)
            if (!this.getOption('params').id) this.rbd.show(new BreakdownView({ model: this.breakdown, scatters: true, hideOverview: true }))
        }
    })

    return EMDataCollections
})
