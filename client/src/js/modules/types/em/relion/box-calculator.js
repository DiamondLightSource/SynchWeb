/**
 * Auto calculate particle box parameters (if required)
 * Runs whenever any parameter value is updated.
 *
 * @param {string} name the name of the parameter just updated
 * @param {object} parameters a reference to all of the parameters
 */
export default function (name, parameters) {
    const commit = function(diameter, size, sizeSmall) {
        parameters.mask_diameter = diameter
        parameters.extract_boxsize = size
        parameters.extract_small_boxsize = sizeSmall
    }

    const boxSizeSmall = function(extract_boxsize, angpix) {
        const boxSizes = [
            48, 64, 96, 128, 160, 192, 256, 288, 300, 320, 360, 384,
            400, 420, 450, 480, 512, 640, 768, 896, 1024,
        ];
        for (const boxSize in boxSizes) {
            if (boxSize > extract_boxsize) {
                return extract_boxsize
            }
            if (((angpix * extract_boxsize) / boxSize) < 4.25) {
                return boxSize
            }
        }
        return "Box size is too large!";
    }

    const applicableParameters = [
        'autopick_LoG_diam_max',
        'angpix',
        'wantCalculate',
        'stop_after_ctf_estimation',
    ]

    if (!(
        applicableParameters.includes(name) &&
        parameters.wantCalculate &&
        !parameters.stop_after_ctf_estimation
    )) {
        return
    }

    const angpix = parseFloat(parameters.angpix)
    const autopick_LoG_diam_max = parseFloat(parameters.autopick_LoG_diam_max)

    if (angpix == 0.0 || isNaN(angpix) || isNaN(autopick_LoG_diam_max)) {
        commit('', '', '')
        return
    }

    const particleSizePixels = autopick_LoG_diam_max / angpix
    const mask_diameter = Math.round(autopick_LoG_diam_max * 1.1)
    const boxSizeExact = particleSizePixels * 1.2
    const boxSizeInt = Math.ceil(boxSizeExact)
    const extract_boxsize = boxSizeInt + (boxSizeInt % 2)
    const extract_small_boxsize = boxSizeSmall(extract_boxsize, angpix)

    commit(
        mask_diameter.toString(),
        extract_boxsize.toString(),
        extract_small_boxsize.toString()
    )
}
