define(['marionette',
    'views/filter',
    'modules/blstats/views/online',
    'modules/blstats/views/logon',
    'modules/blstats/views/beamline',
    'modules/blstats/views/autoproc',
    'modules/blstats/views/robot',
    'modules/blstats/views/pdbs',

    ], function(Marionette,
        FilterView,
        OnlineView,
        LogonView,
        BeamlineView,
        AutoProcView,
        RobotView,
        PDBView){
    
    return Marionette.LayoutView.extend({
        template: _.template('<div class="filter filter-nohide"></div><div class="wrapper"></div>'),
        regions: {
            types: '.filter',
            cont: '.wrapper',
        },
        
        onRender: function() {
            this.typeselector = new FilterView({
                filters: [
                    { id: 'robot', name: 'Robot Stats' },
                    { id: 'lgon', name: 'Logon Stats' },
                    { id: 'online', name: 'Online Stats' },
                    { id: 'bl', name: 'Beamline Stats' },
                    { id: 'pl', name: 'Pipeline Stats' },
                    { id: 'pdb', name: 'PDB Stats' },
                ],
                value: this.getOption('type') || 'lgon',
                urlFragment: 'statistics',
            })
            this.listenTo(this.typeselector, 'selected:change', this.switchType, this)
            this.types.show(this.typeselector)
            this.switchType(this.getOption('type') || 'lgon')
        },
        
        switchType: function(type) {
            var types = {
                lgon: LogonView,
                online: OnlineView,
                bl: BeamlineView,
                pl: AutoProcView,
                robot: RobotView,
                pdb: PDBView,
            }
            
            if (!types[type]) return
            this.cont.show(new types[type]({ type: this.getOption('subtype') }))
        },
        
    })
    

})