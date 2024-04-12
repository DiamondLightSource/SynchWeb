/* eslint no-useless-escape: "off"*/
define(['backbone', 'backbone-validation'], function(Backbone) {

    _.extend(Backbone.Validation.patterns, {
        wwsdash: /^(\w|\s|\-)+$/,
        wwsldash: /^(\w|\s|\-|\/)+$/,
        wwsbdash: /^(\w|\s|\-|\(|\))+$/,
        wwsbddash: /^(\w|\s|\-|\.|\(|\))+$/,
        wwdash: /^(\w|\-)+$/,
        datetime: /^\d\d-\d\d-\d\d\d\d \d\d:\d\d$/,
        edate: /^\d\d-\d\d-\d\d\d\d$/,
        word: /^\w+$/,
        fcode: /^DLS\-(MX|IN|CY|BI)\-\d\d\d\d$/i,
        time: /^\d\d:\d\d$/,
        sequence: /^[>;\s\w+\n\(\)\.\|]+$/,
        address: /^(\w|\s|\-|\n|,)+$/,
        array: /^[\d+(.\d+)?),]+$/,
        country: /^(\w|\s|\-|,|\(|\)|')+$/,
        visit: /^\w+\d+-\d+$/,
        visitornull: /^\w+\d+-\d+$|^(?![\s\S])/,
        twopath: /^(\w|-)+\/?(\w|-)+$/,
        numberorword: /(^\w+$)|(^\d+$)/
    })
    
    _.extend(Backbone.Validation.messages, {
        required: 'This field is required',
        wwsdash: 'This field must contain only letters, numbers, spaces, underscores, and dashes',
        wwsldash: 'This field must contain only letters, numbers, spaces, underscores, slashes, and dashes',
        wwsbdash: 'This field must contain only letters, numbers, spaces, underscores, brackets, and dashes',
        wwsbddash: 'This field must contain only letters, numbers, spaces, underscores, dots, brackets, and dashes',
        wwdash: 'This field must contain only letters, numbers, underscores, and dashes',
        datetime: 'This field must be of the format DD-MM-YYYY HH:MM',
        edate: 'Please specify a valid date (european style)',
        word: 'This field must contain only letters and numbers',
        fcode: 'This field must be of the format DLS-XX-XXXX',
        time: 'This field must be of the format HH:MM',
        sequence: 'This field may only contain word characters and line returns',
        address: 'This field may only contain word character, spaces, and line returns',
        array: 'This field may only contain numbers and commas',
        country: 'This field must contain only letters, numbers, spaces, underscores, dashes, and commas',
        visit: 'This field must be of the format xxx123-123',
        visitornull: 'This field must be of the format xxx123-123 or a null value',
        twopath: 'This field can hold a path with two folders',
        numberorword: 'This field can either hold numbers or a word'
    })

})
