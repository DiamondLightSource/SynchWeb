define([], function() {

    return {

        // The csv column names
        headers: ['Proposal Code', 'Proposal Number', 'Visit Number', 'Shipping Name', 'Dewar Code',  'Puck',      'preObsResolution', 'minimalResolution', 'Oscillation Range', 'Protein Acronym', 'Protein Name', 'Space Group',
         'Barcode', 'Sample Name', 'Location', 'Comments', 'Cell A', 'Cell B', 'Cell C', 'Cell Alpha', 'Cell Beta', 'Cell Gamma', 'Sublocation', 'Loop Type', 'Required Resolution', 'Centring Method', 'Experiment Kind',
         'Radiation Sensitivity', 'Energy', 'User Path', 'Screen and Collect Recipe', 'S&C N value',           'Sample Group'],

        // ... and their ISPyB table mapping
        mapping: ['PROPOSALCODE',  'PROPOSALNUMBER',  'VISITNUMBER',  'SHIPPINGNAME', 'FACILITYCODE', 'CONTAINER', 'OBSERVEDRESOLUTION', 'MINIMUMRESOLUTION', 'AXISRANGE',       'ACRONYM',         'PROTEINNAME', 'SPACEGROUP',
         'CODE',    'NAME',        'LOCATION', 'COMMENTS', 'CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'SUBLOCATION', 'LOOPTYPE',  'REQUIREDRESOLUTION',  'CENTRINGMETHOD',  'EXPERIMENTKIND',
         'RADIATIONSENSITIVITY',  'ENERGY', 'USERPATH',  'SCREENINGMETHOD',           'SCREENINGCOLLECTVALUE', 'SAMPLEGROUPNAME'],

        // Columns to show on the import page
        columns: {
            LOCATION: 'Location',
            ACRONYM: 'Protein Acronym',
            NAME: 'Name',
            SAMPLEGROUPNAME: 'Sample Group',
            CODE: 'Barcode',
            COMMENTS: 'Comment',
            USERPATH: 'User Path',
            SPACEGROUP: 'Spacegroup',
            CELL: 'Cell',
            CENTRINGMETHOD: 'Centring Method',
            EXPERIMENTKIND: 'Experiment Kind',
            ENERGY: 'Energy (eV)',
            SCREENINGMETHOD: 'Screening Method',
            REQUIREDRESOLUTION: 'Required Res',
            MINIMUMRESOLUTION: 'Minimum Res',
            SCREENINGCOLLECTVALUE: 'Number to collect',
        },

        // Import transforms
        transforms: {
            SPACEGROUP: function(v, m) {
                m.SPACEGROUP = v.replace(/[\(\)]/g, '').toUpperCase()
            }
        },

        exampleCSV: `cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,DF150E0221,TestInsulin-x00021,1,Z1992316315,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,-CANT-FIND,TestInsulin-x00022,2,Z1787158625,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,-CANT-FIND,TestInsulin-x00023,3,Z1275599911,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,DF150E0765,TestInsulin-x00024,4,Z3201466300,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,-CANT-FIND,TestInsulin-x00025,5,Z8187272620,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,DF150E1412,TestInsulin-x00026,6,Z1454840342,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,-CANT-FIND,TestInsulin-x00027,7,Z1563512128,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,-CANT-FIND,TestInsulin-x00028,8,Z5567190000,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,-CANT-FIND,TestInsulin-x00029,9,Z1650868495,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,DF150E0472,TestInsulin-x00030,10,Z1741785925,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,DF150E0413,TestInsulin-x00031,11,Z2510259379,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,DF150E0797,TestInsulin-x00032,12,Z2856434779,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,-CANT-FIND,TestInsulin-x00033,13,Z2856434839,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,DF150E0888,TestInsulin-x00034,14,Z1432018343,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,DF150E0553,TestInsulin-x00035,15,Z4884759400,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry
cm,28170,67,cm28170-53_2021-09-21_15-40-49,cm28170-53_TestInsulin,I03-0001,,,,TestInsulin,TestInsulin,P422,-CANT-FIND,TestInsulin-x00036,16,Z1315161580,57,57,149,90,90,90,1,,1.8,diffraction,XChem Low Symmetry`
    }

})
