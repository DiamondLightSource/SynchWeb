/**
 * Model for a member of a sample group
 */

define(['backbone'], function(Backbone) {
  return Backbone.Model.extend({
    idAttribute: 'BLSAMPLEGROUPSAMPLEID',
    sampleGroupId: null,
    urlRoot() {
      return `/sample/groups/${this.sampleGroupId}/samples`
    },

    initialize(attributes) {
      let sampleGroupId = null
      if (attributes.BLSAMPLEGROUPID) {
        sampleGroupId = attributes.BLSAMPLEGROUPID
      } else {
        sampleGroupId = this.collection.sampleGroupId
      }
      this.sampleGroupId = sampleGroupId
    },

    defaults: {
      THEORETICALDENSITY: '',
      PACKINGFRACTION: '',
      BLSAMPLEID: '',
      SAMPLE: '',
      CRYSTAL: '',
      DIMENSION1: '',
      DIMENSION2: '',
      DIMENSION3: '',
    },

    validation: {
      BLSAMPLEID: {
        required: true,
        pattern: 'digits',
      },

      GROUPORDER: {
        required: false,
        pattern: 'digits',
      },

      TYPE: {
        required: false,
        pattern: 'word'
      },
    }
  })
})
