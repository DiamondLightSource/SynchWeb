export default function() {
    // TODO: find a simpler way of doing this
    const windowWidth = window.innerWidth
    const proportionalHeight = 0.175 * windowWidth * 0.95
    const heightScalingFactor = windowWidth < 800 ? 1.65 : (
        windowWidth < 1280 ? 1.3 : 1
    )
    return Math.round(
        proportionalHeight * heightScalingFactor * 0.8
    );
}
