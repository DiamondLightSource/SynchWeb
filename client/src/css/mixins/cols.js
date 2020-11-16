/*
* Mixin for column layout
* This covers the legacy case of styling columns while we transition to flexbox
* Parameters are: number_of_columns, padding, margin, multiplier (for thirds/two thirds layout)
* Padding (as a percentage) can either be:
* - single number (padding same all round), 
* - double (top/bottom, left/right), 
* - four values top, right, bottom, left
*
* Examples:
@mixin cols 3, 0;
@mixin cols 2, 0 0 0 1;
@mixin cols 3, 0 1% 0 0, 0, 2;
*
* It is a crude implementation that just returns a block of css.
* It does not do anything with the passed node or its parent, therefore
* minor tweak to media query are required to produce the correct output
*/
module.exports = function(mixin, numColumns, pad, marg='0', multi='1') {
    var parent = mixin.parent

    var n = parseInt(numColumns)
    var scale = parseInt(multi)

    var p = getPadding(pad)
    var m = getPadding(marg)
    
    var colWidth = (100/n)*scale - p - m;

    var node = parent
    // Handle media queries - in this case we want the first child node of the media query
    // which will be the correct selector 
    if (!parent.selector && parent.name == 'media') {
        node = mixin.parent.first
    }
    node.append({prop: 'width', value: colWidth})
    node.append({prop: 'margin', value: marg})
    node.append({prop: 'padding',value: pad})
    // Crude method to output object.
    // Does not handle media queries properly
    // return {
    //     width: colWith,
    //     margin: marg,
    //     padding: pad,
    // }
}
// Utility function to return padding based on an array of space delimited values
// We can use the same function for margin because it combines css left and right properties
function getPadding(pad) {
    var p = 0
    var padding = pad.split(' ')

    // Handle cases where padding is specified as one, two or four values
    if (padding.length == 1) {
        p = parseFloat(padding[0])*2;
    } else if (padding.length == 2) {
        p = parseFloat(padding[1])*2;
    } else if (padding.length == 4) {
        p = parseFloat(padding[1]) + parseFloat(padding[3]);
    } else {
        console.log("mixin: cols, error with passed padding/margin value. Length of array = " + padding.length)
    }

    return p
}

