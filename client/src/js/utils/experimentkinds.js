define([], function() {

    return {
        opts: function() {
            let list = this.getList()

            return _.map(list, function(v,s) { return '<option value="'+v+'">'+s+'</option>' }).join()
        },
        obj: function() {
            let list = this.getList()

            return _.invert(list)
        },

        key: function(value) {
            let list = this.getList()

            return _.invert(list)[value]
        },

        /* Return a merged list if the user is staff */
        getList: function() {
            let list = this.list

            if (app.staff) list = Object.assign(list, this.staff)

            return list
        },

        list: {
            '': '',
            'native': 'OSC',
            'phasing': 'SAD',
            'ligand': 'Ligand binding',
            'stepped': 'Stepped transmission',
        },

        staff: {
            'commissioning': 'Commissioning'
        }
    }
})
