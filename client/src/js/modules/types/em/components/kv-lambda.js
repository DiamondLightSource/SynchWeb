/**
 * @returns {object} with lambda / kV conversion functions
 */
export default function() {
    const m = 9.10938356e-31
    const h = 6.62607004e-34
    const c = 2.99792458e8
    const e = 1.60217662e-19

    return {
        'kV2l': function(kV) { // kV to lambda (in A)
            const U = kV * 1e3
            return (h / Math.sqrt(
                2 * m * e * U + (Math.pow(e * U / c, 2))
            )) * 1e10
        },
        'l2kV': function(l) { // lambda (in A) to kV
            return (
                (
                    (-2 * m * e) + Math.sqrt(
                        Math.pow(2 * m * e, 2) +
                        4 * Math.pow(e * h / (c * l * 1e-10), 2)
                    )
                ) / (2 * Math.pow(e / c, 2)) / 1000
            ).toFixed(0)
        },
    }
}
