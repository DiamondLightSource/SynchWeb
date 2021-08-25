export default function(response) {
    return response.data.map(function(parameter) {
        return {
            'key': parameter.PARAMETERKEY,
            'value': parameter.PARAMETERVALUE,
        }
    })
}
