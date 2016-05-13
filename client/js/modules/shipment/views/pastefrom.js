define(['views/dialog',
        'models/protein',
        'models/sample',
    
    ], function(DialogView, Protein, Sample) {

        
    // Use Location as idAttribute for this table
    var LocationSample = Sample.extend({
        idAttribute: 'LOCATION',
    })
        
    return DialogView.extend({
        template: _.template('<p>Press ctrl-v to paste container contents from the clipboard</p><textarea name="pasted"></textarea>'),
        title: 'Paste from Clipboard',
        
        buttons: {
            'Insert': 'insertContent',
            'Close': 'closeDialog',
        },
        
        ui: {
            content: 'textarea[name=pasted]',
        },
        
        
        insertContent: function() {
            var data = { samples: [] }
            var lines = this.ui.content.val().split('\n')

            var newp = []

            _.each(lines, function(l, i) {
                var cols = l.split('\t')
                
                if (cols[2] == 'Puck') data.title = cols[3]
                
                if (cols[0] > 0 && cols[0] <= 16) {
                    if (cols[2]) {
                        var sample = {}
                        
                        cols[2] = cols[2].replace(/\W/g, '')
                        var p = this.getOption('proteins').findWhere({ ACRONYM: cols[2] })

                        if (!p)
                            if (newp.indexOf(cols[2]) == -1) newp.push(cols[2])
            
                        sample.ACRONYM = cols[2]
                        sample.SPACEGROUP = cols[3]
                        sample.NAME = cols[4]
                        sample.CODE = cols[5]
                        sample.COMMENTS = cols[19]
                        sample.LOCATION = cols[0]
                        
                        data.samples.push(new LocationSample(sample))
                    }
                }
            }, this)
            
            var self = this
            _ready = []
            _.each(newp, function(acr, i) {
                var p = new Protein({ ACRONYM: acr })
                _ready.push(p.save({}, {
                    success: function() {
                        self.getOption('proteins').add(p)
                    }
                }))
            })

            
            $.when.apply($, _ready).done(function() {
                _.each(data.samples, function(s,i) {
                    var p = self.getOption('proteins').findWhere({ ACRONYM: s.get('ACRONYM') })
                    if (p) s.set('PROTEINID', p.get('PROTEINID'))
                    else console.log('Could not find protein for acronym:'+s.get('ACRONYM'))
                })

                self.trigger('content:parsed', data)
                self.closeDialog()
            })
        },
        
    })
    
    
})