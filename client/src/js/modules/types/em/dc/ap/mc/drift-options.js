import utils from 'utils'

export default Object.assign(
    {},
    utils.default_plot,
    {
        'xaxis': {
            'min': -20,
            'max': 20,
        },
        'yaxis': {
            'min': -20,
            'max': 20,
        },
        'series': {
            'lines': {
                'show': true
            },
            'points': {
                'show': true,
                'radius': 1,
            },
        },
    }
)
