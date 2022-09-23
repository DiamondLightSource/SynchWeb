define(['backbone'], function(Backbone) {
  var dc = Backbone.Model.extend({
    defaults: { STATE: false, FLAG: false },
                                 
    initialize: function() {
      this.on('change', this._add_fields, this)
      this._add_fields()
        
      this.flag.bind(this)
    },
    idAttribute: 'ID',
    urlRoot: function() { return '/dc/single'+(this.get('TYPE') ? '/t/'+this.get('TYPE') : '') },
                                       
    _add_fields: function() {
        if (this.get('RUNSTATUS')) {
            this.set('FLAG', this.get('COMMENTS') ? this.get('COMMENTS').indexOf('_FLAG_') > -1 : false)
            this.set('STATE', this.get('RUNSTATUS') == null ? 1 : (this.get('RUNSTATUS').indexOf('Successful') > -1))
        } else {
            this.set('STATE', 2)
        }
        
        if (this.get('FILETEMPLATE')) {
            this.set('FILETEMPLATETRIM', this.get('FILETEMPLATE').replace('_####.cbf', ''))
        }
    },

    flag: function() {
        var c = this.get('COMMENTS')
        if (this.get('FLAG')) c = c.replace(' _FLAG_','')
        else c += ' _FLAG_'
            
        this.set('COMMENTS', c)
        this.save(this.changedAttributes(), { patch: true })
    },
      
  })
  
  return dc
  
})
