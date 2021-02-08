define([], function() {

  return {
    wwsdash: {
      regex: /^(\w|\s|\-)+$/,
      message: 'This field must contain only letters, numbers, spaces, underscores, and dashes',
    },
    wwsldash: {
      regex: /^(\w|\s|\-|\/)+$/,
      message: 'This field must contain only letters, numbers, spaces, underscores, dashes and forward slash',
    },
    wwsbdash: {
      regex: /^(\w|\s|\-|\(|\))+$/,
      message: 'This field must contain only letters, numbers, spaces, underscores, dashes and brackets',
    },
    wwdash: {
      regex: /^(\w|\-)+$/,
      message: 'This field must contain only letters, numbers, underscores, and dashes',
    },
    datetime: {
      regex: /^\d\d-\d\d-\d\d\d\d \d\d:\d\d$/,
      message: 'This field must be of the format DD-MM-YYYY HH:MM',
    },
    edate: {
      regex: /^\d\d-\d\d-\d\d\d\d$/,
      message: 'Please specify a valid date (european style)',
    },
    word: {
      regex: /^\w+$/,
      message: 'This field must contain only letters and numbers',
    },
    fcode: {
      regex: /^DLS\-(MX|IN|CY|BI)\-\d\d\d\d$/i,
      message: 'This field must be of the format DLS-XX-XXXX',
    },
    time: {
      regex: /^\d\d:\d\d$/,
      message: 'This field must be of the format HH:MM',
    },
    sequence: {
      regex: /^[>;\s\w+\n\(\)\.\|]+$/,
      message: 'This field may only contain word characters and line returns',
    },
    address: {
      regex: /^(\w|\s|\-|\n|,)+$/,
      message: 'This field may only contain word character, spaces, and line returns',
    },
    array: {
      regex: /^[\d+(.\d+)?),]+$/,
      message: 'This field may only contain numbers and commas',
    },
    country: {
      regex: /^(\w|\s|\-|,|\(|\)|')+$/,
      message: 'This field must contain only letters, numbers, spaces, underscores, dashes, and commas',
    },
    visit: {
      regex: /^\w+\d+-\d+$/,
      message: 'This field must be of the format xxx123-123',
    },
    twopath: {
      regex: /^(\w|-)+\/?(\w|-)+$/,
      message: 'This field can hold a path with two folders',
    }
  }
})
