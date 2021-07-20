export default function(dataSource) {
    return {
        'angstrom': '#197;',
        'electron': 'e<span class="super">-</span>',
        'angstromSquared': '#197;<span class="super">2</span>',
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
        'datumWithUnit': function(field, unit) {
            const value = this.fieldString[field]
            return value ? value + unit : ''
        },
        'fieldString': function(field) {
            const value = this.dataSource ? this.dataSource[field] : ''
            return value ? value : ''
        },
    }
}
