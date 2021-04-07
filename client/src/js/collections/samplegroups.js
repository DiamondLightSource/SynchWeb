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
        idField: null,

        validation: {
            NAME: {
                required: false,
                pattern: 'wwsbdash',
            }
        },

        initialize: function(attribute, option) {
           this.idField = option[this.idAttribute]
        },

        fetch(options) {
            options = _.extend({}, options)
            
            var model = this
            var success = options.success;

            options.success = function(resp) {
                model.set(resp)
                if (success) success(model, resp, options)
            }

            const updatedModel = _.extend(this, { url: `/sample/groups/name/${this.idField}` })
            return Backbone.sync('read', updatedModel, options)
        },
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

        sampleGroupNameModel: function(options) {
            return new SampleGroup({}, options)
        }
    })
})
