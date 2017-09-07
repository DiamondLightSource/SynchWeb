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
        },
        
        extra: {
            projects: 'Projects',
            cell: 'Unit Cell Search',
        },
        
        admin: {
            'dewars/overview': { title: 'Logistics', icon: 'truck' },
            statistics: { title: 'Stats', icon: 'pie-chart' },
            faults: { title: 'Fault Reports', icon: 'tasks' },
        },
    }
    
})