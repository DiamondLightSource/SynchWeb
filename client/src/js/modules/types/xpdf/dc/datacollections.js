/**
 * The view of all data collections for XPDF
 */
define([
  "views/filter",
  "modules/dc/datacollections",
  "modules/types/gen/dc/dclist",
  "modules/types/xpdf/dc/dc",
  "modules/dc/views/dc",
  "templates/types/xpdf/dc/dclist.html",
], function (Filter, DataCollections, DCList, DCItemView, MXView, template) {
  var XpdfDCList = DCList.extend({
    dcViews: {
      data: DCItemView,
      collectionTypeSpecific: { "OSC": MXView, "Diamond Anvil High Pressure": MXView },
    },
    apStatus: true,
  });

  return DataCollections.extend({
    dcListView: XpdfDCList,
    template: template,
    filters: true,
    sampleChanger: false,

    initialize: function (options) {
      DataCollections.prototype.initialize.apply(this, arguments);
      this.ty = new Filter({
        value: options.params.type,
        collection: options.collection,
        filters: [
          { id: "nscrystal", name: "Standard" },
          { id: "scrystal", name: "Single Crystal" },
        ],
      });
    },
  });
});
