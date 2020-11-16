
/*
* This is a custom clearfix rule that matches the previous sass version from modules/_utility
* In future we could simply replace this with another postcss plugin as there are a few
* postcss-clearfix, postcss-utils etc.
*/
module.exports = function(mixin) {
    var parent = mixin.parent
    var selectors = parent.selectors
    // Rules in both :before and :after
    var commonRule = null
    // Rules in just :after
    var afterRule = null
    // Rules at root level of the node i.e. .clearfix
    var plainRule = null

    // Rules common to before and after
    selectors = selectors.map(function (selector) {
        return selector + ':before, ' + selector + ':after';
    }).join(',\n');

    commonRule = parent.cloneAfter({
        selector: selectors
    }).removeAll();

    commonRule.append(
        {
            prop: 'content',
            value: '\" \"',
            source: mixin.source
        }, 
        {
            prop: 'display',
            value: 'table',
            source: mixin.source
        },
    );

    // After Rule - redefining selectors
    selectors = parent.selectors.map(function (selector) {
        return selector + ':after';
    }).join(',\n');

    afterRule = parent.cloneAfter({
        selector: selectors
    }).removeAll();

    afterRule.append(
        {
            prop: 'clear',
            value: 'both',
            source: mixin.source
        },
    );

    // Plain Rule - redefining selectors
    selectors = parent.selectors;

    plainRule = parent.cloneAfter({
        selector: selectors
    }).removeAll();

    plainRule.append(
        {
            prop: 'zoom',
            value: '1',
            source: mixin.source
        },
    );

    if (mixin.prev() === undefined && mixin.next() === undefined) {
        parent.remove();
    } else {
        mixin.remove();
    }
}