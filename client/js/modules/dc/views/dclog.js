define(['marionette'], function(Marionette) {


    var LogItem = Marionette.ItemView.extend({
        tagName: 'li',
        getTemplate: function() {
            var temps = {
                data: '<span class="title">New data collection</span> <a href="#"><%=DIR%><%=FILETEMPLATE%></a>',
                grid: '<span class="title">New grid scan</span> <a href="#"><%=DIR%><%=FILETEMPLATE%></a>',
                edge: '<span class="title">New edge scan</span> <a href="#"><%=DIR%></a>',
                mca: '<span class="title">New MCA fluorescence spectrum</span> <a href="#"><%=DIR%></a>',
                load: '<span class="title">New sample loaded</span> <a href="#">Puck: <%=EXPOSURETIME%> Pin: <%=RESOLUTION%> Barcode: <%=DIR%></a>',
                action: '<span class="title">New sample action</span> <a href="#"><%=IMP%></a>',
            }
            
            return _.template(this.model.get('ST').replace(/\d+-\d+-\d+ /, '')+' - '+temps[this.model.get('TYPE')])
        },
        
        events: {
            'click a': 'gotoEvent'
        },
        
        gotoEvent: function(e) {
            e.preventDefault()
            var pos = $('.data_collection[dcid="'+this.model.get('ID')+'"]').offset().top
            $('body').animate({scrollTop: pos}, 300);
        },
    })
    
    
    
    return Marionette.CompositeView.extend({
        template: _.template('<h1>Log</h1><ul></ul>'),
        className: 'log border',
        childView: LogItem,
        childViewContainer: 'ul',
    })


})