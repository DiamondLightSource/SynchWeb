/**
 * The 'Add Container' view for XPDF experiments 
 */

define([
    'backbone',
    'marionette',
    'modules/shipment/views/containeradd',
    'modules/types/xpdf/shipment/views/instancetable',
    'modules/shipment/views/plate',
    'modules/types/xpdf/shipment/views/puck',
    'modules/types/xpdf/collections/instances',
    'modules/types/xpdf/shipment/views/sampletable',

    'modules/types/xpdf/shipment/collections/containertypes',
    'modules/shipment/collections/containerregistry',

    'templates/types/xpdf/shipment/containeradd.html',
    'templates/types/xpdf/shipment/sampletable.html',
    'templates/types/xpdf/shipment/sampletablerow.html'
    ], function(
        Backbone,
        Marionette,
        GenericContainerAdd,
        InstanceTableView,
        PlateView,
        PuckView,

        Instances,
        SampleTableView,

        XpdfStageTypes,
        ContainerRegistry,
        template,
        table,
        row
    ) {


    var ContainerAdd = GenericContainerAdd.extend({
        template: template,     
        
        // Override the plate types with the XPDF sample stages
        initialize: function(options) {
            ContainerAdd.__super__.initialize.call(this, options)
            this.ctypes = new XpdfStageTypes(null, { filtered: false })

            for(var i = this.ctypes.length-1; i >=0; i--){
                var c = this.ctypes.models[i]
                if(c.get('deprecated'))
                    c.destroy()
            }

            this.blSamples = new Instances(null, {state: {pageSize: 9999}})
            this.blSamples.queryParams.seq = 1
            this.blSamples.queryParams.dcp = 1
            this.blSamples.fetch()

            let self = this
            this.containerregistry = new ContainerRegistry(null, { state: { pageSize: 9999 }})
            this.containerregistry.fetch().done(function() {
                self.ui.registry.html('<option value="!">Please select one</option>'+self.containerregistry.opts({ empty: true }))
            })
        },
        
        // Override the setType function with XPDF specific gubbins
        setType: function(e) {
            this.type = this.ctypes.findWhere({name: this.ui.type.val()})
            this.type.set({isSelected: true})
            this.model.set({
                CAPACITY: this.type.get('capacity'),
                CONTAINERTYPE: this.type.get('name'),
            })
            
            // Show type-specific elements
            this.puck.$el.css('width', app.mobile() ? '100%' : '50%')
            if(this.type.get('name') == 'Puck')
                this.puck.show(new PuckView({ collection: this.samples}))
            else
                this.puck.show(new PlateView({ collection: this.samples, type: this.type, showValid: true }))
            this.buildCollection()
            this.stable = new SampleTableView({ blSamples: this.blSamples, proteins: this.proteins, gproteins: this.gproteins, collection: this.samples, childTemplate: row, template: table })
            this.table.show(this.stable)
            this.single.empty()
            this.ui.pc.show()
            
        },
        
        selectSample: function() {
        },

        onSubmit: function(e) {
            e.preventDefault()

            this.model.set({
                NAME: this.ui.registry[0].options[this.ui.registry[0].options.selectedIndex].innerText,
                CONTAINERREGISTRYID: this.ui.registry[0].value
            })

            this.model.validate()

            if(this.model.isValid()){
                this.$el.find('form').addClass('loading')

                let self = this
                this.model.save(null, {
                    success: function(response){
                        var ready = false
                        var samplesToMove =  new Instances()

                        self.samples.find(function(model){
                            if(model.has('BLSAMPLEID'))
                                samplesToMove.add(model)
                        })

                        if(samplesToMove.length == 0)
                            ready = true

                        samplesToMove.forEach(function(element, index){
                            if(element.get('BLSAMPLEID')){
                                Backbone.ajax({
                                    url: app.apiurl+'/sample/' + element.get('BLSAMPLEID'),
                                    method: 'post',
                                    data: {
                                        CONTAINERID: response.get('CONTAINERID'),
                                        LOCATION: element.get('LOCATION'),
                                        _METHOD: 'patch'
                                    },

                                    success: function(resp){
                                        console.log('Succesfully moved samples to this container')
                                        if(index == samplesToMove.length -1)
                                            ready = true
                                    },

                                    error: function(resp){
                                        console.log('Failed to move BLSample to this container')
                                        app.alert({ message: 'Failed to move BLSample:' + resp.get('BLSAMPLEID') + 'to this container!', scrollTo: false })
                                    }
                                })
                            }
                        })

                        var check = function(){
                            if(ready){
                                self.$el.find('form').removeClass('loading')
                                self.cache.set({data: {}})
                                self.cache.save({}, {})
                                app.trigger('container:show', response.get('CONTAINERID'))
                            } else {
                                setTimeout(check, 1000)
                            }
                        }
                        check()
                    },
                    error: function(response){
                        console.log('Failed to add container!')
                        app.alert({ message: 'Failed to add container!'})
                        self.$el.find('form').removeClass('loading')
                    }
                })
            }
        }

    })

    return ContainerAdd
})
