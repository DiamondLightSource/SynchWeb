/**
 * Auto calculate particle box parameters (if required)
 * Runs whenever any parameter value is updated.
 *
 * @param {string} name the name of the parameter just updated
 * @param {object} errors a vee validate error bag
 * @param {object} parameters a reference to all of the parameters
 */
export default function (name, errors, parameters) {
    const commit = function(diameter, size, sizeSmall) {
        parameters.particleMaskDiameter = diameter
        parameters.particleBoxSize = size
        parameters.particleBoxSizeSmall = sizeSmall
    }

    const boxSizeSmall = function(particleBoxSize, pixelSize) {
        const boxSizes = [
            48, 64, 96, 128, 160, 192, 256, 288, 300, 320, 360, 384,
            400, 420, 450, 480, 512, 640, 768, 896, 1024,
        ];
        for (const boxSize in boxSizes) {
            if (boxSize > particleBoxSize) {
                return particleBoxSize
            }
            if (((pixelSize * particleBoxSize) / boxSize) < 4.25) {
                return boxSize
            }
        }
        return "Box size is too large!";
    }

    const applicableParameters = [
        'particleDiameterMax', 'pixelSize',
        'particleCalculateForMe', 'pipelineDo1stPass',
    ]

    if (!(
        applicableParameters.includes(name) &&
        parameters.particleCalculateForMe.value &&
        parameters.pipelineDo1stPass.value
    )) {
        return
    }

    const pixelSize = errors.has('pixelSize') ? NaN :
        parseFloat(parameters.pixelSize.value)

    const particleDiameterMax = errors.has('particleDiameterMax') ? NaN :
        parseFloat(parameters.particleDiameterMax.value)

    if (pixelSize == 0.0 || isNaN(pixelSize) || isNaN(particleDiameterMax)) {
        commit('', '', '')
        return
    }

    const particleSizePixels = particleDiameterMax / pixelSize
    const particleMaskDiameter = Math.round(particleDiameterMax * 1.1)
    const boxSizeExact = particleSizePixels * 1.2
    const boxSizeInt = Math.ceil(boxSizeExact)
    const particleBoxSize = boxSizeInt + (boxSizeInt % 2)
    const particleBoxSizeSmall = boxSizeSmall(particleBoxSize, pixelSize)

    commit(
        particleMaskDiameter.toString(),
        particleBoxSize.toString(),
        particleBoxSizeSmall.toString()
    )
}
