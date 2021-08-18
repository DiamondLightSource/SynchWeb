/**
 * Auto calculate particle box parameters (if required)
 * Runs whenever any parameter value is updated.
 *
 * @param {string} name the name of the parameter just updated
 * @param {object} store the VueX storage module
 * @param {object} params a reference to all of the parameters
 */
export default function (name, store, params) {
    const commit = function(diameter, size, sizeSmall) {
        store.commit('em/relion/updateParam', {
            'name': 'particleMaskDiameter', 'value': diameter
        })
        store.commit('em/relion/updateParam', {
            'name': 'particleBoxSize', 'value': size
        })
        store.commit('em/relion/updateParam', {
            'name': 'particleBoxSizeSmall', 'value': sizeSmall
        })
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

    const applicableParams = [
        'particleDiameterMax', 'pixelSize',
        'particleCalculateForMe', 'pipelineDo1stPass',
    ]

    if (!(
        applicableParams.includes(name) &&
        params.particleCalculateForMe &&
        params.pipelineDo1stPass
    )) {
        return
    }

    const pixelSize = store.hasFormError(
        'pixelSize'
    ) ? NaN : parseFloat(params.pixelSize)

    const particleDiameterMax = store.hasFormError(
        'particleDiameterMax'
    ) ? NaN : parseFloat(params.particleDiameterMax)

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
