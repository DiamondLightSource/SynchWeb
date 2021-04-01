/*
 * A table of the instances in an XPDF sample changer.
 */

define(['backgrid',
    'backbone',
    'modules/types/xpdf/models/instance',
    'modules/shipment/views/sampletable',
    'views/dialog',
    'modules/types/xpdf/samples/views/samplecontainerview',
    'templates/types/xpdf/shipment/sampletable.html',
    'templates/types/xpdf/shipment/sampletablerow.html',
    'templates/types/xpdf/shipment/sampletablerowedit.html',
    ], function(
    Backgrid,
    Backbone,
    Instance,
    SampleTableView,
    DialogView,
    SampleContainerView,
    table, tablerow, tablerowedit
    ) {
    
    var GridRow = SampleTableView.GridRow.extend({
        rowTemplate: tablerow, 
        editTemplate: tablerowedit,

        events: _.extend({}, SampleTableView.GridRow.prototype.events, {
            'click a.cont': 'showEditContainers',
        }),

        showEditContainers: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: 'Edit Containers', className: 'content', view: new SampleContainerView({ dialog: true, parent: this.model }), autoSize: true }))
        },

        initialize: function(options) {
            GridRow.__super__.initialize.call(this, options)

            if (options && options.blSamples) {
                this.blSamples = options.blSamples
                this.containerId = options.containerId
                this.samples = options.samples
                this.listenTo(this.blSamples, 'reset add change', this.updateBLSamples, this)
            }
        },

        onRender: function() {
            GridRow.__super__.onRender.call(this)

            this.$el.find('select[name=CRYSTALID]').combobox({ invalid: this.invalidBLSample.bind(this), change: this.selectBLSample.bind(this), select: this.selectBLSample.bind(this) })
            this.updateBLSamples()

            if (this.model.get('BLSAMPLEID') > -1) this.$el.find('select[name=CRYSTALID]').combobox('value', this.model.get('BLSAMPLEID'))
            this.$el.find('div[class=ui-combobox]').css('width', '100%')
        },

        invalidBLSample: function(ui, val) {
            ui.combobox('value', -1).trigger('change')    
        },

        selectBLSample: function(ui, val) {
            this.validateField.apply(this,arguments)

            // Get the BLSample model for the item selected in the drop down
            var c = this.blSamples.findWhere({ACRONYM: val.item.innerText})
            // If row is populated, below line will get the sample already there, not the one we clicked
            //var c = this.blSamples.findWhere({ BLSAMPLEID: this.$el.find('select[name=CRYSTALID]').combobox('value') })

            // Is the BLSample model selected already in this container? If so where?
            var inContainer = this.samples.findWhere({ BLSAMPLEID: c.get('BLSAMPLEID')})
            var inContainerLoc = inContainer ? inContainer.get('LOCATION') : 0

            // Does the location have a BLSample in it already? If so we need to remove it first
            if(this.model.get('BLSAMPLEID') != -1 && this.model.get('CRYSTALID') != -1 && this.model.get('PROTEINID') != -1){
                this.clearSample()
            }

            if (c) {
                loc = this.$el.find('td[name=LOCATION]')[0].innerHTML
                c.set('LOCATION', loc)

                if(this.containerId){
                    let self = this
                    c.set('CONTAINERID', this.containerId)

                    Backbone.ajax({
                        url: app.apiurl+'/sample/' + c.get('BLSAMPLEID'),
                        method: 'post',
                        data: {
                            CONTAINERID: this.containerId,
                            LOCATION: this.$el.find('td[name=LOCATION]')[0].innerHTML,
                            PLANORDER: 1,
                            _METHOD: 'patch'
                        },

                        success: function(response) {
                            console.log("Updated BLSample containerId & position")
                            // If the BLSample was already in this container, remove it from the current location in the table and replace with a blank BLSample
                            if(inContainerLoc > 0) {
                                self.samples.remove(self.samples.at(parseInt(inContainerLoc-1)))
                                self.samples.add(new Instance({LOCATION: inContainerLoc, CRYSTALID: -1, PROTEINID: -1}), {at:parseInt(inContainerLoc-1)})
                            }
                            // Remove existing BLSample and replace with selected one
                            self.samples.remove(self.samples.at(parseInt(loc)-1))
                            self.samples.add(c, {at: parseInt(loc)-1})
                        },
                        error: function(response) {
                            app.alert({ title: 'Error', message: 'Failed to update BLSample containerId & position' + response })
                            console.log('Failed to update BLSample containerId & position ' + response)
                        },
                    })
                } else {
                    // If the BLSample was already in this container, remove it from the current location in the table and replace with a blank BLSample
                    if(inContainerLoc > 0) {
                        this.samples.remove(this.samples.at(parseInt(inContainerLoc-1)))
                        this.samples.add(new Instance({LOCATION: inContainerLoc, CRYSTALID: -1, PROTEINID: -1}), {at:parseInt(inContainerLoc-1)})
                    }
                    this.samples.remove(this.samples.at(parseInt(loc)-1))
                    this.samples.add(c, {at: parseInt(loc)-1})
                    console.log('Added BLSample: ' + c.get('BLSAMPLEID') + ' to collection to be added to the new container')
                }
            }
        },

        editSample: function(e) {
            GridRow.__super__.editSample.call(this, e)
            this.updateBLSamples()
        },

        clearSample: function(e) {
            if(e) e.preventDefault()

            if(this.containerId) {
                // Only way to know if this is the default container, and 'this' refers to the table row and not the page
                var containerName = document.querySelectorAll('span.NAME')[0].innerText

                // We can't completely remove single samples from the default container as we would lose the ability to add it back anywhere else
                // See below for overwriting which will shuffle positions based on free spaces
                if(e && containerName.startsWith(app.prop) && containerName.endsWith('_samples')) {
                    app.alert({title: 'Error', message: 'Cannot clear samples from this container. You may move them by overwriting however.'})
                    return
                }

                let self = this

                Backbone.ajax({
                    // We need to make sure this removal completes before adding the replacement
                    async: false,
                    url: app.apiurl+'/sample/' + this.model.get('BLSAMPLEID'),
                    method: 'post',
                    data: {
                        CONTAINERID: 0,
                        LOCATION: 0,
                        PLANORDER: 1,
                        _METHOD: 'patch'
                    },

                    success: function(response){
                        console.log('Successfully removed BLSample from this container');
                        // If this is the default container, we need to shuffle samples around within it based on the free slots
                        // If it's not the default container we have moved the sample to the default container and can just reset the model at this position
                        if(containerName.startsWith(app.prop) && containerName.endsWith('_samples')){
                            var modelToMove = self.model
                            modelToMove.set({LOCATION: response.LOCATION})
                            self.samples.remove(self.samples.at(response.LOCATION-1))
                            self.samples.remove(modelToMove)
                            self.samples.add(modelToMove, {at: response.LOCATION-1})
                        } else {
                            var location = self.model.get('LOCATION')
                            self.samples.remove(self.samples.at(parseInt(location)-1))
                            self.samples.add(new Instance({LOCATION: location, CRYSTALID: -1, PROTEINID: -1}), {at:parseInt(location)-1})
                        }
                    },
                    error: function(response){
                        app.alert({ title: 'Error', message: 'Failed to remove BLSample from this container' + response })
                        console.log('Failed to remove BLSample from this container ' + response);
                    }
                })
            } else {
                // Without a containerId nothing is persisted to the database yet so we just need to clear the UI row
                var location = this.model.get('LOCATION')
                this.samples.remove(this.samples.at(parseInt(location-1)))
                this.samples.add(new Instance({LOCATION: location, CRYSTALID: -1, PROTEINID: -1}), {at:parseInt(location-1)})
            }
        },

        updateBLSamples: function() {
            this.$el.find('select[name=CRYSTALID]').html(this.blSamples.opts())
            this.$el.find('select[name=CRYSTALID]').combobox('value', this.model.get('BLSAMPLEID'))
        },
    })


    var SampleTableView = SampleTableView.extend({
        template: table,
        childView: GridRow,

        initialize: function(options) {
            SampleTableView.__super__.initialize.call(this, options)
            this.options.childViewOptions.blSamples = options.blSamples
            this.options.childViewOptions.samples = options.collection
            this.options.childViewOptions.containerId = options.containerId
        },
    })
    
    return SampleTableView
})
