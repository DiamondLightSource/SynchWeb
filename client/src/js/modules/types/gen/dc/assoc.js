define(['views/dialog',
        'collections/samples',
    
        'templates/types/gen/dc/assoc.html',
        'jquery'
    ], function(DialogView, Samples, template, $) {

    return DialogView.extend({
        template: template,
        title: 'Associate Sample',
        
        buttons: {
            'Associate': 'associateSample',
            'Cancel': 'closeDialog',
        },
        
        ui: {
            sample: 'input[name=sample]',
            sn: '.sample',
        },
        
        // updateSamples: function() {
        //     this.ui.shipment.html(this.samples.opts())
        // },
                    
        associateSample: function() {
            if (!this.sample) return
            var s = this.samples.findWhere({ BLSAMPLEID: this.sample.value })
            if (s) {
                console.log('sample', s)
                this.model.set({ 
                    BLSAMPLEID: s.get('BLSAMPLEID'),
                    SAMPLE: s.get('NAME')
                })
            }

            var self = this
            this.model.save(this.model.changedAttributes(), {
                patch: true,

                success: function() {
                    app.alert({ className: 'message notify', message: 'Sample successfully associated' })
                    self.trigger('sample:associated')
                    self.closeDialog()
                },
                error: function() {
                    app.alert({ message: 'Something went wrong associating this sample, please try again' })
                },
            })
        },
        
        
        initialize: function(options) {
            this.sample = null
            this.samples = new Samples()
        },

        onRender: function() {
            this.ui.sample.autocomplete({ 
                source: this.getSamples.bind(this),
                select: this.selectSample.bind(this)
            })

            // hmm
            this.$el.find('.ui-autocomplete').css('z-index', 9999)
        },

        selectSample: function(e, ui) {
            e.preventDefault()

            this.ui.sn.text(ui.item.label)
            console.log(ui.item.label, ui.item.value)
            this.sample = ui.item
            this.ui.sample.val('')
        },

        getSamples: function(req, resp) {
            var self = this
            this.samples.fetch({
                data: {
                    s: req.term,
                },
                success: function(data) {
                    var d = self.samples.map(function(m) {
                        return {
                            label: m.get('NAME') + ' (' + m.get('ACRONYM') + ')',
                            value: m.get('BLSAMPLEID'),
                        }
                    })
                    resp(d)
                }
            })
        },
        
    })

})