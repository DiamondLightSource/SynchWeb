
/*
* TEST
*/
module.exports = function(mixin) {
    var parent = mixin.parent
    // Rules at root level of the node i.e. .clearfix

    console.log("Selector = " + parent.selector)
    console.log("Str = " + parent.toString())

    // Handle media queries - we need to expand the properties into the first child (selector)
    if (!parent.selector && parent.name == 'media') {
        console.log("Parent is not a selector, media query detected: " + parent.name)
        
        parent.first.append(
            {
                prop: 'zoom',
                value: '1000',
                source: mixin.source
            },
        );
    
    } else {        
        parent.append(
            {
                prop: 'zoom',
                value: '99',
                source: mixin.source
            },
        );
    }
}