define([], function() {
    return {
        menu: {
            dc: 'View All Data',
            visits: 'Visits',
            cal: 'Calendar',
            shipments: 'Shipments',
            contacts: 'Lab Contacts',
            'dewars/registry': 'Registered Dewars',
            stats: 'Statistics',
        },
        extra: {
            //projects: 'Projects',
        },
        admin: {
            'dewars/overview': { title: 'Logistics', icon: 'fa-truck', permission: 'all_dewars' },
            faults: { title: 'Fault Reports', icon: 'fa-tasks' },
        },
    }
})
