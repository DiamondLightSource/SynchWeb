/**
 * Responsive scaling of images and plots within views
 *
 * @returns {number} new height in pixels
 */
export default function() {
    const windowWidth = window.innerWidth
    const proportionalHeight = 0.175 * windowWidth * 0.95
    const heightScalingFactor = windowWidth < 800 ? 1.65 : (
        windowWidth < 1280 ? 1.3 : 1
    )
    return Math.round(
        proportionalHeight * heightScalingFactor * 0.8
    );
}
