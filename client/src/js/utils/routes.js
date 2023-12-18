define([], function() {

    return {
    
        /**
         * Get the value of a parameter segement value pair from a specific param, e.g. "pathMatch"
         * To allow routes to have segment value pairs in any order add ":pathMatch(.*)*" to the end of a route and use this function 
         * to extract the value, e.g. routes /john/a?/:a?/b?/:b and /john/b?/:b/a?/:a? can be replaced with /john/:path<atch(.*)*
         * and the props with a:getParamValue(route.params.pathMatch, "a"), b:getParamValue(route.params.pathMatch, "b")
         * @param {object} params the parameter object created in a route
         * @param {string} paramName the name of the parameter
         * @returns value of parameter or undefined if parameter was not found or had no value
         */
        getParamValue: function(params, paramName) { 
            return (params || " ").substring(1).split('/').filter( (_, index, arr) => index > 0 && arr[index-1] === paramName)[0]
        },

    }    
    
})
