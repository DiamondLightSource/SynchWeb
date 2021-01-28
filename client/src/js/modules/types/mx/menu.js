define([], function() {

    return {
        menu: {
            dc: 'View All Data',
            visits: 'Visits',
            calendar: 'Calendar',
            assign: 'Assign Containers',
            'samples/groups': 'Sample Group Management',
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
            'runs/overview': { title: 'Run Overview', icon: 'bar-chart', permission: 'all_breakdown' },
            'stats/overview/beamlines': { title: 'Reporting', icon: 'line-chart', permission: 'all_prop_stats' },
            'admin/imaging': { title: 'Imaging', icon: 'image', permission: 'imaging_dash' },
            'dewars/overview': { title: 'Logistics', icon: 'truck', permission: 'all_dewars' },
            statistics: { title: 'Stats', icon: 'pie-chart' },
            faults: { title: 'Fault Reports', icon: 'tasks' },
        },
    }
})
