define([], function() {

    return function(m, map) {
        var mapping = map || {
            GREEN: 'active',
            YELLOW:'minor',
            RED: 'inactive'
        }

        var clss = ''

        var safetyLevel = m.get('SAFETYLEVEL')
        // isExternal means the sample has come from a User Office
        var isExternal = m.get('EXTERNAL') == '1'
        // approved_samples flag - if we care about validity check external, else its ok.
        var approvedSample = app.options.get('valid_components') ? isExternal : true

        if (safetyLevel == 'GREEN' && approvedSample)  clss = mapping.GREEN
        if (safetyLevel == 'YELLOW' && approvedSample) clss = mapping.YELLOW
        if (safetyLevel == 'RED' && approvedSample)    clss = mapping.RED

        return clss
    }

})  
