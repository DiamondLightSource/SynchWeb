define(['backbone', 'backbone-validation'], function(Backbone) {

    _.extend(Backbone.Validation.patterns, {
        wwsdash: /^(\w|\s|\-)+$/,
        wwsbdash: /^(\w|\s|\-|\(|\))+$/,
        wwdash: /^(\w|\-)+$/,
        datetime: /^\d\d-\d\d-\d\d\d\d \d\d:\d\d$/,
        edate: /^\d\d-\d\d-\d\d\d\d$/,
        word: /^\w+$/,
        fcode: /^DLS\-MX\-\d\d\d\d$/i,
        datetime: /\d+-\d+-\d+ \d+:\d+/,
        sequence: /[>|;|\w+|\n]/,
    });
    
    _.extend(Backbone.Validation.messages, {
        required: 'This field is required',
        wwsdash: 'This field must contain only letters, numbers, spaces, underscores, and dashes',
        wwdash: 'This field must contain only letters, numbers, underscores, and dashes',
        datetime: 'Please specify a valid date and time',
        edate: 'Please specify a valid date (european style)',
        word: 'This field must contain only letters and numbers',
        fcode: 'This field must be of the format DLS-MX-XXXX',
        datetime: 'This field must be of the format DD-MM-YYYY HH:MM',
        sequence: 'This field may only contain word characters and line returns',
    });

})