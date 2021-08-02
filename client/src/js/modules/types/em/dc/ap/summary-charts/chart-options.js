import utils from 'utils'

export default Object.assign(
    {},
    utils.default_plot,
    {
        'xaxis': {
            'tickFormatter': function(
                val, // eslint-disable-line no-unused-vars
                axis // eslint-disable-line no-unused-vars
            ) {
                return ''
            }
        },
        'grid': {
            'borderWidth': 0,
            'margin': {
                'top': 0,
                'left': 50,
                'bottom': 0,
                'right': 50,
            },
        },
        'series': {
            'lines': {
                'show': true
            },
        },
    }
)
