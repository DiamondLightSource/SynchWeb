define([], function() {
    
    return {
        menu: {
            dc: 'View All Data',
            visits: 'Visits',
            calendar: 'Calendar',
            shipments: 'Shipments',
            containers: 'Containers',
            samples: 'Samples',
            proteins: 'Components',
            contacts: 'Lab Contacts',
            stats: 'Statistics',
        },
        
        extra: {
        },
        
        admin: {
            'stats/overview/beamlines': { title: 'Reporting', icon: 'line-chart', permission: 'all_prop_stats' },
            'dewars/overview': { title: 'Logistics', icon: 'truck', permission: 'all_dewars' },
            statistics: { title: 'Stats', icon: 'pie-chart' },
            faults: { title: 'Fault Reports', icon: 'tasks' },
        },
    }
    
})