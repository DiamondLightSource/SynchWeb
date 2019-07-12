/**
 * Dialog to upload a CIF file to be associated with an XPDF sample.
 */

define(['modules/samples/views/addpdb',
        'modules/types/gen/samples/models/cif',
        'templates/types/xpdf/samples/addcif.html'
    ], function(AddPDB, CIF, template) {

    return AddPDB.extend({
        template: template,
        title: 'Add CIF to Phase',

        createModel: function(options) {
            this.model = new CIF({ PROTEINID: options.pid })
        },
    })

})
