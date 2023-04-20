define(['backbone.paginator', 'modules/imaging/models/inspectionimagescore', 'utils/kvcollection'], 
    function(PageableCollection, InspectionImageScore, KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: InspectionImageScore,
        mode: 'client',
        url: '/imaging/inspection/images/scores',
                       
        keyAttribute: 'TITLE',
        valueAttribute: 'BLSAMPLEIMAGESCOREID',

        state: {
              pageSize: 9999,
        },

        initialize: function(options) {
            this.on('change:isSelected', this.onSelectedChanged, this)
            this.trig = true
        },
        
        onSelectedChanged: function(model) {
            this.each(function(model) {
                if (model.get('isSelected') === true && !model._changing) {
                    model.set({isSelected: false})
                }
            })
            if (this.trig) this.trigger('selected:change')
        },
        
        setSelected: function(id) {
            this.trig = false
            sc = this.findWhere({ imagescoreid: id })
            if (sc) sc.set('isSelected', true)
            else {
                var sel = this.findWhere({ isSelected: true })
                if (sel) sel.set('isSelected', false)
            }
            this.trig = true
        },
      
    }))
})