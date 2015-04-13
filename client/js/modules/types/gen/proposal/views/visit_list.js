define(['modules/proposal/visit_list', 'utils/table', 'tpl!templates/types/gen/proposal/visitlinks.html'], function(VisitList, table, visitlinks) {
    
    return VisitList.extend({
        linksCell: table.TemplateCell,
        linksTemplate: visitlinks,
    })


})