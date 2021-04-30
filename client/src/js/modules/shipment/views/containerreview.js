define(['marionette',
    'backgrid',
    'views/table',
    'utils/table',
    'collections/samples',
    'templates/shipment/containerreview.html'
], function(Marionette,
    Backgrid,
    TableView,
    table,
    Samples,
    template) {

    var UCTemplate = '\
        <table class="reflow unitcell">\
            <thead>\
                <tr>\
                    <th>A</th>\
                    <th>B</th>\
                    <th>C</th>\
                    <th>&alpha;</th>\
                    <th>&beta;</th>\
                    <th>&gamma;</th>\
                </tr>\
            </thead>\
            <tbody>\
                <tr>\
                    <td><%-CELL_A%></td>\
                    <td><%-CELL_B%></td>\
                    <td><%-CELL_C%></td>\
                    <td><%-CELL_ALPHA%></td>\
                    <td><%-CELL_BETA%></td> \
                    <td><%-CELL_GAMMA%></td>\
                </tr>\
            </tbody>\
        </table>'

    var ActionCell = Backgrid.Cell.extend({
        className: 'nowrap',

        events: {
            'click a.reinspect': 'markInspect',
            'click a.skip': 'markSkip'
        },

        render: function() {
            if (app.staff) {
                this.$el.html('<a href="#" class="button reinspect" title="Mark sample for reinspection"><i class="fa fa-eye"></i></a>')
                this.$el.append(' <a href="#" class="button skip" title="Mark sample as skipped"><i class="fa fa-step-forward"></i></a>')
            }
            
            this.$el.append(' &nbsp; <a href="/samples/sid/'+this.model.get('BLSAMPLEID')+'" class="view button button-notext" title="View sample details"><i class="fa fa-search"></i> <span>View Sample</span></a>')
                
            return this
        }
    })

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            rsamples: '.rsamples'
        },

        initialize: function(options) {
            this.samples = new Samples(null, { state: { pageSize: 9999 } })
            this.samples.queryParams.cid = options.model.get('CONTAINERID')
            this.samples.fetch()
        },

        onRender: function() {
            var columns = [
                { name: 'LOCATION', label: 'Location', cell: 'string', editable: false },
                { name: 'NAME', label: 'Name', cell: 'string', editable: false },
                { name: 'ACRONYM', label: 'Protein', cell: 'string', editable: false },
                { name: 'COMMENTS', label: 'Comment', cell: 'string', editable: false },
                { name: 'SPACEGROUP', label: 'SG', cell: 'string', editable: false },
                { label: 'Unit Cell', cell: table.TemplateCell, template: UCTemplate, editable: false },
                { name: 'REQUIREDRESOLUTION', label: 'Required Res', cell: 'string', editable: false },
                { name: 'AIMEDRESOLUTION', label: 'Aimed Res', cell: 'string', editable: false },
                { name: 'COLLECTIONMODE', label: 'Mode', cell: 'string', editable: false },
                { name: 'PRIORITY', label: 'Priority', cell: 'string', editable: false },
                { name: 'EXPOSURETIME', label: 'Exposure (s)', cell: 'string', editable: false },
                { name: 'AXISRANGE', label: 'Axis Range', cell: 'string', editable: false },
                { name: 'AXISSTART', label: 'No Images', cell: 'string', editable: false },
                { name: 'TRASMISSION', label: 'Transmission', cell: 'string', editable: false },
                { name: 'DCRESOLUTION', label: 'Observed Res', cell: 'string', editable: false },
                { name: 'DCSPACEGROUP', label: 'Observed SG', cell: 'string', editable: false },
                { name: 'STAFFCOMMENTS', label: 'Staff Comments', cell: 'string', editable: app.staff },
                { label: 'Status', cell: table.StatusCell, editable: false },
                { label: '', cell: ActionCell, editable: false },
            ]

            this.rsamples.show(new TableView({
                collection: this.samples,
                columns: columns
            }))  

            this.listenTo(this.samples, 'change:STAFFCOMMENTS', this.saveStaffComment, this)
        }, 

        saveStaffComment: function(m, v) {
            m.save(m.changedAttributes(), { patch: true })
        },
    })
})

a = {
      "BLSAMPLEID": "3221723",
      "CRYSTALID": "2794556",
      "SCREENCOMPONENTGROUPID": null,
      "PARENTSAMPLEID": null,
      "PARENTSAMPLE": null,
      "BLSUBSAMPLEID": null,
      "INSPECTIONS": "0",
      "PROP": "cm28170",
      "CODE": "",
      "LOCATION": "16",
      "ACRONYM": "Blah",
      "PROTEINID": "440420",
      "SPACEGROUP": "",
      "COMMENTS": "",
      "STAFFCOMMENTS": null,
      "NAME": "xtal_32",
      "SHIPMENT": "test_samples",
      "SHIPPINGID": "39740",
      "DEWARID": "45092",
      "DEWAR": "DLS-MX-0001",
      "CONTAINER": "I03R-007",
      "CONTAINERID": "192068",
      "SCLOCATION": "",
      "SC": "1",
      "GR": "2",
      "DC": "0",
      "AI": "8",
      "AP": "0",
      "R": "1",
      "SCRESOLUTION": null,
      "SCCOMPLETENESS": null,
      "DCRESOLUTION": null,
      "DCCOMPLETENESS": null,
      "ANOMALOUSSCATTERER": "",
      "REQUIREDRESOLUTION": null,
      "CELL_A": null,
      "CELL_B": null,
      "CELL_C": null,
      "CELL_ALPHA": null,
      "CELL_BETA": null,
      "CELL_GAMMA": null,
      "PACKINGFRACTION": null,
      "DIMENSION1": null,
      "DIMENSION2": null,
      "DIMENSION3": null,
      "SHAPE": null,
      "THEORETICALDENSITY": null,
      "CRYSTAL": null,
      "PROTEIN": "Blah",
      "LOOPTYPE": null,
      "CENTRINGMETHOD": null,
      "EXPERIMENTKIND": null,
      "CONTAINERQUEUEID": null,
      "QUEUEDTIMESTAMP": null,
      "COMPONENTNAMES": null,
      "COMPONENTDENSITIES": null,
      "COMPONENTIDS": null,
      "COMPONENTACRONYMS": null,
      "COMPONENTGLOBALS": null,
      "COMPONENTAMOUNTS": null,
      "COMPONENTTYPESYMBOLS": null,
      "VOLUME": null,
      "SYMBOL": null,
      "ABUNDANCE": null,
      "RECORDTIMESTAMP": "12-01-2021",
      "RADIATIONSENSITIVITY": null,
      "ENERGY": null,
      "USERPATH": null,
      "AIMEDRESOLUTION": null,
      "PREFERREDBEAMSIZEX": null,
      "PREFERREDBEAMSIZEY": null,
      "EXPOSURETIME": null,
      "AXISSTART": null,
      "AXISRANGE": null,
      "NUMBEROFIMAGES": null,
      "TRANSMISSION": null,
      "COLLECTIONMODE": null,
      "PRIORITY": null,
      "DCSPACEGROUP": null
    }