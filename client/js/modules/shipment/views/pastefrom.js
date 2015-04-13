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
            _.each(lines, function(l, i) {
                var cols = l.split('\t')
                
                if (cols[2] == 'Puck') data.title = cols[3]
                
                if (cols[0] > 0 && cols[0] <= 16) {
                    if (cols[2]) {
                        var sample = {}
                        
                        cols[2] = cols[2].replace(/\W/g, '')
                        var p = this.getOption('proteins').findWhere({ ACRONYM: cols[2] })
                        
                        if (!p) {
                            console.log('generating protein', cols[2])
                            var p = new Protein({ ACRONYM: cols[2] })
                            p.save({}, { async: false })
                            this.getOption('proteins').fetch()
                        }
                        sample.PROTEINID = p.get('PROTEINID')
            
                        sample.SPACEGROUP = cols[3]
                        sample.NAME = cols[4]
                        sample.CODE = cols[5]
                        sample.COMMENTS = cols[19]
                        sample.LOCATION = cols[0]
                        
                        data.samples.push(new LocationSample(sample))
                    }
                }
            }, this)
            
            this.trigger('content:parsed', data)
            this.closeDialog()
        },
        
    })
    
    
})