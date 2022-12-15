define(['backbone', 'collections/samplegroupsamples'], function(Backbone, SampleGroupSamples) {
  return Backbone.Model.extend({
    idAttribute: 'BLSAMPLEGROUPID',
    urlRoot: function() {
      return `/sample/groups/${this.sampleGroupId}/samples`
    },

    initialize(attributes) {
      this.sampleGroupId = attributes.BLSAMPLEGROUPID
      this.MEMBERS = new SampleGroupSamples
      this.MEMBERS.sampleGroupId = this.id
    },

    validation: {
      NAME: {
        required: true,
        pattern: 'wwdash',
      }
    }
  })
})