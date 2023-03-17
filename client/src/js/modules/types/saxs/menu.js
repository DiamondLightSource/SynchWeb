define([], function() {
    
    return {
        menu: {
            dc: 'View All Data',
            visits: 'Visits',
            cal: 'Calendar',
            shipments: 'Shipments',
            containers: 'Containers',
            samples: 'Samples',
            proteins: 'Proteins',
            contacts: 'Lab Contacts',
            // stats: 'Statistics',
        },
        
        extra: {
        },
        
        admin: {
            'runs/overview': { title: 'Run Overview', icon: 'fa-bar-chart', permission: 'all_breakdown' },
            'dewars/overview': { title: 'Logistics', icon: 'fa-truck', permission: 'all_dewars' },
            faults: { title: 'Fault Reports', icon: 'fa-tasks' },
        },
    }
    
})
