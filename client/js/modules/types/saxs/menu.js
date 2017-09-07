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
            'dewars/overview': { title: 'Logistics', icon: 'truck', permission: 'all_dewars' },
            faults: { title: 'Fault Reports', icon: 'tasks' },
        },
    }
    
})