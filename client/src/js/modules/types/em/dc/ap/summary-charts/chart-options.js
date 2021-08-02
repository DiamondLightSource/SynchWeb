import utils from 'utils'

export default Object.assign(
    {},
    utils.default_plot,
    {
        'grid': {
            'backgroundColor': '#fff',
            'borderColor': '#fff',
        },
        'xaxis': {
            'tickFormatter': function(
                val, // eslint-disable-line no-unused-vars
                axis // eslint-disable-line no-unused-vars
            ) {
                return ''
            }
        },
        'series': {
            'lines': {
                'show': true
            },
        },
    }
)
