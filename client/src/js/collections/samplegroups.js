/**
 *  A collection of sample group members
 */

define(['backbone',
    'backbone.paginator',
    'models/samplegroup',
    'underscore'
    ], function(Backbone,
        PageableCollection,
        SampleGroupMember,
        _
    ) {


    var SampleGroup = Backbone.Model.extend({
        urlRoot: '/sample/groups/name',
        idAttribute: 'BLSAMPLEGROUPID',

        validation: {
            NAME: {
                required: false,
                pattern: 'wwsbdash',
            }
        }
    })

    var SampleGroupCollection = Backbone.Collection.extend({
        model: SampleGroup,
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
            console.log('generating groups', e)
            var groups = []

            var groupids = _.unique(this.pluck('BLSAMPLEGROUPID'))
            _.each(groupids, function(g) {
                var members = this.where({ BLSAMPLEGROUPID: g })

                if (this.newType) {
                    var nm = new SampleGroupMember({
                        BLSAMPLEGROUPID: g,
                        GROUPORDER: members.length+1,
                        TYPE: this.newType,
                    })
                    nm.parent = this
                    members.push(nm)
                }

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

        save: function(options) {
            options = _.extend({}, options)
            
            var collection = this
            var success = options.success;

            options.success = function(resp) {
                collection.reset(resp, { silent: true })
                if (success) success(collection, resp, options)
            }

            const sampleGroupList = this.pluck('BLSAMPLEGROUPID');

            if (_.uniq(sampleGroupList).length === 1) {
                const updateCollection = _.extend(this, { url: `/sample/groups/${sampleGroupList[0]}` })
                return Backbone.sync('update', updateCollection, options)
            }
            
            return Backbone.sync('create', this, options)
        },

    })
})
