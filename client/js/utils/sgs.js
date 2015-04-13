define([], function() {
    
    return {
        obj: function() {
            var ob = {}
            _.each(this.list, function(sg) {
                ob[sg] = sg
            })

            return ob
        },
        opts: function() {
            return _.map(this.list, function(s) { return '<option value="'+s+'">'+s+'</option>' }).join()
        },
        list: ['',
    'P1',
    'P2',
    'P21',
    'C2',
    
    'P23',
    'F23',
    'I23',
    'P213',
    'I213',
    
    'P222',
    'P2221',
    'P21212',
    'P212121',
    'C222',
    'C2221',
    'F222',
    'I222',
    'I212121',
    
    
    'P4',
    'P41',
    'P42',
    'P43',
    'P422',
    'P4212',
    'P4122',
    'P41212',
    'P4222',
    'P42212',
    'P4322',
    'P43212',
    'I4',
    'I41',
    'I422',
    'I4122',
    
    'P3',
    'P31',
    'P32',
    'R3',
    'P312',
    'P321',
    'P3112',
    'P3121',
    'P3212',
    'P3221',
    'R32',
    
    'P432',
    'P4232',
    'F432',
    'F4132',
    'I432',
    'P4332',
    'P4132',
    'I4132',
    
    'P6',
    'P61',
    'P65',
    'P62',
    'P64',
    'P63',
    'P622',
    'P6122',
    'P6522',
    'P6222',
    'P6422',
    'P6322']
        
    }
    
})