/**
 * Mixin for Vue components to match height to width
 */
export default {
    'computed': {
        'proportionalHeight': function() {
            const windowWidth = window.innerWidth
            const proportionalHeight = 0.175 * windowWidth * 0.95
            const heightScalingFactor = windowWidth < 800 ? 1.65 : (
                windowWidth < 1280 ? 1.3 : 1
            )
            return Math.round(
                proportionalHeight * heightScalingFactor * 0.8
            );
        },
        'plotDivStyle': function() {
            const height = this.proportionalHeight + 'px;'
            return 'height: ' + height +
                ' min-height: ' + height +
                ' max-height: ' + height
        },
    },
}
