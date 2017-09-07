define([], function() {
    
    return {
        menu: {
            dc: 'View All Data',
            visits: 'Visits',
            calendar: 'Calendar',
            shipments: 'Shipments',
            contacts: 'Lab Contacts',
            stats: 'Statistics',
        },
        
        extra: {
            //projects: 'Projects',
        },
        
        admin: {
            'dewars/overview': { title: 'Logistics', icon: 'truck', permission: 'all_dewars' },
            faults: { title: 'Fault Reports', icon: 'tasks' },
        },
    }
    
})