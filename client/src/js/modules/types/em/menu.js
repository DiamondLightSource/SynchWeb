define([], function() {
    
    return {
        menu: {
            dc: 'View All Data',
            visits: 'Visits',
            calendar: 'Calendar',
            shipments: 'Shipments',
            contacts: 'Lab Contacts',
            'dewars/registry': 'Registered Dewars',
            stats: 'Statistics',
        },
        
        extra: {
            //projects: 'Projects',
        },
        
        admin: {
            'runs/overview': { title: 'Run Overview', icon: 'bar-chart'},
            'dewars/overview': { title: 'Logistics', icon: 'truck', permission: 'all_dewars' },
            faults: { title: 'Fault Reports', icon: 'tasks' },
        },
    }
    
})
