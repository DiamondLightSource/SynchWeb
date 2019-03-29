define([], function() {
    
    return {
        menu: {
            dc: 'View All Data',
            visits: 'Visits',
            calendar: 'Calendar',
            assign: 'Assign Containers',
            shipments: 'Shipments',
            dewars: 'Registered Dewars',
            'containers/registry': 'Registered Containers',
            containers: 'Containers',
            samples: 'Samples',
            proteins: 'Proteins',
            contacts: 'Lab Contacts',
            stats: 'Statistics',
            migrate: 'Migrate',
        },
        
        extra: {
            projects: 'Projects',
            cell: 'Unit Cell Search',
        },
        
        admin: {
            'stats/overview/beamlines': { title: 'Reporting', icon: 'line-chart', permission: 'all_prop_stats' },
            'admin/imaging': { title: 'Imaging', icon: 'image', permission: 'imaging_dash' },
            'dewars/overview': { title: 'Logistics', icon: 'truck', permission: 'all_dewars' },
            statistics: { title: 'Stats', icon: 'pie-chart' },
            faults: { title: 'Fault Reports', icon: 'tasks' },
        },
    }
    
})