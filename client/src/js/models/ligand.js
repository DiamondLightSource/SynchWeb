define(['backbone', 'markdown'], function(Backbone, markdown) {
    
    return Backbone.Model.extend({
        idAttribute: 'LIGANDID',
        urlRoot: '/sample/ligands',
        
        validation: {
            NAME: {
                required: true,
                pattern: 'wwdash',
            },
            SMILES: {
                required: false,
                pattern: 'smiles'
            },
            LIBRARYNAME: {
                required: false,
                pattern: 'wwdash',
            },
            LIBRARYBATCHNUMBER: {
                required: false,
                pattern: 'wwdash',
            },
            PLATEBARCODE: {
                required: false,
                pattern: 'wwdash',
            },
            SOURCEWELL: {
                required: false,
                pattern: 'wwdash',  
            },
        },
    })
    
})
