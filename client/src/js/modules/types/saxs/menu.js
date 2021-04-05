define([], function() {
    
    return {
        menu: {
            dc: 'View All Data',
            visits: 'Visits',
            calendar: 'Calendar',
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
            'runs/overview': { title: 'Run Overview', icon: 'bar-chart', permission: 'all_breakdown' },
            'dewars/overview': { title: 'Logistics', icon: 'truck', permission: 'all_dewars' },
            faults: { title: 'Fault Reports', icon: 'tasks' },
        },
    }
    
})
