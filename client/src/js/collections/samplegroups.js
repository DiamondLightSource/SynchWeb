/**
 *  A collection of sample group members
 */

define(['backbone',
    'backbone.paginator',
    'models/samplegroup',
    'models/samplegroupname',
    'underscore'
    ], function(Backbone,
        PageableCollection,
        SampleGroupMember,
        SampleGroupNames,
        _
    ) {
    var SampleGroupCollection = Backbone.Collection.extend({
        model: SampleGroupNames,
    })


    var SampleGroupMembers = Backbone.Collection.extend({
        comparator: function(m) {
            return parseInt(m.get('GROUPORDER'))
        },
    })


    return PageableCollection.extend({
    
        model: SampleGroupMember,
        url: '/sample/groups',

        mode: 'server',

        state: {
            pageSize: 100,
        },

        addNew: true,
        newType: 'container',

        initialize: function(options) {
            this._groups = new SampleGroupCollection()
            this._groups.parent = this
            this.listenTo(this, 'sync update', this.generateGroups, this)
            this.generateGroups()
        },

        generateGroups: function(e) {
            var groups = []

            var groupids = _.unique(this.pluck('BLSAMPLEGROUPID'))
            _.each(groupids, function(g) {
                var members = this.where({ BLSAMPLEGROUPID: g })

                var nm = new SampleGroupMember({
                    BLSAMPLEGROUPID: g,
                    GROUPORDER: members.length+1,
                    TYPE: 'container',
                })
                nm.parent = this
                members.push(nm)

                groups.push({
                    BLSAMPLEGROUPID: g,
                    NAME: members.length && members[0].get('NAME'),
                    MEMBERS: new SampleGroupMembers(members),
                    NUM_MEMBERS: members.length
                })
            }, this)

            this._groups.reset(groups)
        },


        groups: function() {
            return this._groups
        },

        parseRecords: function(r, options) {
            return r.data
        },

        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },

        sampleGroupNameModel: function(options) {
            return new SampleGroupNames({}, options)
        }
    })
})
