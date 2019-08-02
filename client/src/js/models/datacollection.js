define(['backbone'], function(Backbone) {
  var dc = Backbone.Model.extend({
    idAttribute: 'ID',
    urlRoot: function() { return '/dc/single'+(this.get('TYPE') ? '/t/'+this.get('TYPE') : '') },
      
      
    /*parse: function(resp, options) {
        console.log(options)
        return options.data && options.data.pp ? resp : resp[1][0]
    },*/
      
    defaults: { STATE: false, FLAG: false },
                                 
    initialize: function() {
      this.on('change', this._add_fields, this)
      this._add_fields()
        
      this.flag.bind(this)
    },
                                 
    _add_fields: function() {
      if (this.get('RUNSTATUS')) {
        this.attributes['FLAG'] = this.get('COMMENTS') ? this.get('COMMENTS').indexOf('_FLAG_') > -1 : false
        this.attributes['STATE'] = this.get('RUNSTATUS') == null ? 1 : (this.get('RUNSTATUS').indexOf('Successful') > -1)
      } else {
        this.attributes['STATE'] = 2
      }
        
       if (this.get('FILETEMPLATE')) this.attributes['FILETEMPLATETRIM'] = this.get('FILETEMPLATE').replace('_####.cbf', '')
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
