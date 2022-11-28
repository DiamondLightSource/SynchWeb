define([], function() {
    
    return {
        menu: {
            dc: 'View All Data',
            visits: 'Visits',
            cal: 'Calendar',
            assign: 'Assign Containers',
            shipments: 'Shipments',
            'dewars/registry': 'Registered Dewars',
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
            'runs/overview': { title: 'Run Overview', icon: 'fa-bar-chart', permission: 'all_breakdown' },
            'stats/overview/beamlines': { title: 'Reporting', icon: 'fa-line-chart', permission: 'all_prop_stats' },
            'admin/imaging': { title: 'Imaging', icon: 'fa-image', permission: 'imaging_dash' },
            'dewars/overview': { title: 'Logistics', icon: 'fa-truck', permission: 'all_dewars' },
            statistics: { title: 'Stats', icon: 'fa-pie-chart' },
            faults: { title: 'Fault Reports', icon: 'fa-tasks' },
        },
    }
})
