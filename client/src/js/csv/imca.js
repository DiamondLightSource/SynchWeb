define([], function() {

    return {
        // The csv column names
        headers: ['Puck',      'Pin',      'Project', 'Priority', 'Mode',           'Notes to Staff', 'Collection strategy', 'Contact person', 'Expected space group', 'Expected Cell Dimensions', 'Expected Resolution', 'Minimum Resolution Required to Collect', 'Recipe', 'Exposure time', 'Image Width', 'Phi',          'Attenuation',  'Aperture',           'Detector Distance', 'Prefix for frames', 'Observed Resolution', 'Comments From Staff', 'Status'],
        
        // ... and their ISPyB table mapping
        mapping: ['CONTAINER', 'LOCATION', 'ACRONYM', 'PRIORITY', 'COLLECTIONMODE', 'COMMENTS',       'COMMENTS',            'OWNER',          'SPACEGROUP',           'CELL',                     'AIMEDRESOLUTION',     'REQUIREDRESOLUTION',                     'RECIPE', 'EXPOSURETIME',  'AXISRANGE',   'AXISROTATION', 'TRANSMISSION', 'PREFERREDBEAMSIZEX', 'DETECTORDISTANCE',  'PREFIX',            'DCRESOLUTION',        'DCCOMMENTS',          'STATUS'],

        // Columns to show on the import page
        columns: {
            LOCATION: 'Location',
            PROTEINID: 'Protein',
            NAME: 'Sample',
            PRIORITY: 'Priority',
            COLLECTIONMODE: 'Mode',
            COMMENTS: 'Comments',
            SPACEGROUP: 'Spacegroup',
            CELL: 'Cell',
            AIMEDRESOLUTION: 'Aimed Res',
            REQUIREDRESOLUTION: 'Required Res',
            EXPOSURETIME: 'Exposure (s)',
            AXISRANGE: 'Axis Osc',
            NUMBEROFIMAGES: 'No. Images',
            TRANSMISSION: 'Transmission',
            PREFERREDBEAMSIZEX: 'Beamsize',
        },

        // Import transforms
        transforms: {
            CELL: function(v, m) {
                var comps = v.split(/\s+/)
                _.each(['CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA'], function(ax, i) {
                    if (comps.length > i) m[ax] = comps[i].replace(',', '')
                })
            },
            AXISROTATION: function(v, m) {
                if (m.AXISRANGE) m.NUMBEROFIMAGES = m.AXISROTATION / m.AXISRANGE
            },
            SPACEGROUP: function(v, m) {
                m.SPACEGROUP = v.replace(/[\(\)]/g, '')
            },
            LOCATION: function(v, m) {
                if (!this.xcount) this.xcount = 1
                m.NAME = 'x'+(this.xcount++)
            },
            COLLECTIONMODE: function(v, m) {
                m.COLLECTIONMODE = v.toLowerCase()
            }
        },

        // Export transforms
        export: {
            CELL: function(m) {
                return `${m.CELL_A}, ${m.CELL_B}, ${m.CELL_C}, ${m.CELL_ALPHA}, ${m.CELL_BETA}, ${m.CELL_GAMMA}`.trim()
            },

            STATUS: function(m) {
                var status = 'skipped'
                if (m.QUEUEDTIMESTAMP) status = 'queued';
                if (m.R > 0) status = 'recieved'
                if (m.DC > 0) status = 'collected'

                return status
            },

            AXISROTATION: function(m) {
                return m.AXISRANGE * m.NUMBEROFIMAGES
            },

            COMMENTS: function(m, h) {
                var comments = m.COMMENTS.split(' | ')
                return comments.length > 1 && h == 'Collection strategy' ? comments[1] : comments[0]
            }
        },

        exampleCSV: `Puck,Pin,Project,Priority,Mode,Notes to Staff,Collection strategy,Contact person,Expected space group,Expected Cell Dimensions,Expected Resolution,Minimum Resolution Required to Collect,Recipe,Exposure time,Image Width,Phi,Attenuation,Aperture,Detector Distance,Prefix for frames,Observed Resolution,Comments From Staff,Status
Blue53,1,a,1,Manual,Tricky,Do best you can,Luke,C2,"143.734, 67.095, 76.899, 90, 110.45, 90",1.9-3.5,4,luke-360.rcp,,,,,,,,,,
Blue53,2,a,1,Manual,Very tricky,New crystals,Luke,C2,140 65 75 90 110 90,1.8-2.4,3.5,,0.1,0.25,,95,5,250,image_,,,
Blue53,2,a,1,Manual,Very tricky,New crystals,Luke,C2,140 65 75 90 110 90,1.8-2.4,3.5,,0.1,0.25,,95,5,250,image_,,,
Blue53,3,b,3,Auto,Routine,SeMet,Luke,P2,52.4 39.8 65.0 108.5,1.5,1.7,,0.04,0.25,360,,10,300,,,,
Blue53,4,c,3,Auto,Rods,Native,Luke,P21,39 69.2 60 90 105.3,1.5,1.7,,0.04,0.25,360,95,20,,image_,,,
Blue53,5,d,8,,Plates,,Luke,C222,280 45 112 102 90,1.5,1.7,,0.04,0.25,360,95,50,300,image_,,,
Blue54,1,e,,Auto,,,,P212121,67 82 276,2.1,2.5,,,0.25,180,,10,350,image_,,,
Blue54,2,e,4,,,,Luke,P2(1)2(1)2(1),67 82 276,,1.7,luke-180.rcp,,,,,,,,,,
Blue54,3,f,,Auto,,,,P222,,2.1,,,0.04,,180,95,,350,image_,,,
Blue54,4,g,4,Auto,,,Luke,,,2.1,2.5,,0.04,0.25,180,75,,350,image_,,,
Blue54,5,h,99,Auto,,,Luke,P222,,2.2,2.5,,0.04,0.25,180,95,,400,image_,,,
    `
    }

})
