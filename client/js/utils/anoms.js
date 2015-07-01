define([], function() {
    
    return {
        opts: function() {
            return _.map(this.list.sort(), function(s) { return '<option value="'+s+'">'+s+'</option>' }).join()
        },
        obj: function() {
            var ob = {}
            _.each(this.list.sort(), function(sg) {
                ob[sg] = sg
            })

            return ob
        },

        list: ['',
        "Cr",
        "Mn",
        "Fe",
        "Co",
        "Ni",
        "Cu",
        "Zn",
        "Ga",
        "Ge",
        "As",
        "Se",
        "Br",
        "Kr",
        "Rb",
        "Mo",
        "Ru",
        "Pd",
        "Ag",
        "Cd",
        "In",
        "Te",
        "I",
        "Xe",
        "Ta",
        "W",
        "Os",
        "Pt",
        "Au",
        "Hg",
        "Pb",
        "Sm",
        "Gd",
        "Ho",
        ]
        
    }
    
})