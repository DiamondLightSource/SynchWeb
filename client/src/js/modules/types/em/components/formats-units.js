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
            return this.angstrom + '/pix'
        },
        'electronsPerAngstromSquared': function() {
            return this.electron + '/' + this.angstromSquared
        },
    },
    'methods': {
        'dimensions': function (x, y) {
            if (x || y) {
                return (x + ' x ' + y).trim()
            }
            return ''
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
