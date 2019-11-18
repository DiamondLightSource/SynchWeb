define(['marionette', 'backbone', 'utils/table',
        'collections/proposals',
        'modules/proposal/list',
    ], function(Marionette, Backbone, table,
    Proposals, ProposalList) {

    var ClickableRow = table.ClickableRow.extend({
        event: 'proposal:show',
        argument: 'PROPOSAL',
        cookie: true,
    })

    return ProposalList.extend({
        clickableRow: ClickableRow,
        template: _.template('<h1>Proposals</h1><p class="help">This page lists all proposals. Click on a row to view / edit that proposal</p><div class="ra"><a href="admin/proposals/add" class="button" title="Add anew proposal"><i class="fa fa-plus"></i> Add Proposal</a></div><div class="wrapper"></div>'),
    })

})