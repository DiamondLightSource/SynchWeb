/**
 * Mixin for Vue components to match height to width
 */
export default {
    'computed': {
        'proportionalHeight': function() {
            const windowWidth = window.innerWidth
            const proportionalHeight = (1/7) * windowWidth
            const heightScalingFactor = windowWidth < 800 ? 1.65 : (
                windowWidth < 1280 ? 1.3 : 1
            )
            return 'height: ' + Math.round(
                proportionalHeight * heightScalingFactor
            ) + 'px;';
        },
    },
}
