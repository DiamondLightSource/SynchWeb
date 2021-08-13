/**
 * Mixin for Vue components to provide useful data formatting
 */
export default {
    'computed': {
        'angstrom': function() {
            return '&#197;'
        },
        'electron': function() {
            return 'e<span class="super">-</span>'
        },
        'angstromSquared': function() {
            return this.angstrom + '<span class="super">2</span>'
        },
        'angstromPerPixel': function() {
            return this.angstrom + '/pixel'
        },
        'electronsPerAngstromSquared': function() {
            return this.electron + '/' + this.angstromSquared
        },
    },
    'methods': {
        'pairOfValues': function(x, y, separator) {
            if (x || y) {
                return (x + separator + y).trim()
            }
            return ''
        },
        'dimensions': function (x, y) {
            return this.pairOfValues(x, y, ' x ')
        },
        'range': function (x, y) {
            return this.pairOfValues(x, y, ' - ')
        },
        'numberWithUnit': function(number, unit) {
            if (Number.isNaN(number)) {
                return 'INVALID'
            }
            if (Number.isFinite(number)) {
                return number + unit
            }
            return '&infin;'
        },
        'datumWithUnit': function(value, unit) {
            return value ? value + unit : ''
        },
        'datumOrBlank': function(value) {
            return value ? value : ''
        },
    },
}
