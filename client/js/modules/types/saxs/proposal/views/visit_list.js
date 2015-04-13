define(['modules/proposal/visit_list', 'tpl!templates/types/saxs/proposal/visitlinks.html'], function(VisitList, visitlinks) {
    
    return VisitList.extend({
        linksTemplate: visitlinks,
        clickable: false,
    })


})