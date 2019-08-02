/*
 * Phase composition utility for XPDF samples
 */

define([],
        function() {
    
    // Create an element-multiplicity hash from an arbitrary chemical formula string
    var hashFromComposition = function(compositionIn) {
        var openRegexp = new RegExp(/\(/) // a single literal open bracket
        var closeRegexp = new RegExp(/\)/) // a single literal close bracket
        var bracketedRegexp = openRegexp
        var numberRegexp = new RegExp(/\d*\.?\d+/) // a positive decimal number
        
        var composition = compositionIn
        
        while (composition.search(bracketedRegexp) != -1) {
            // Get the first closing bracket
            var firstClose = composition.indexOf(')')
            // Get the last open bracket before this
            var previousOpen = composition.lastIndexOf('(', firstClose)
            // And get the multiplicity, and note the location at which the
            // formula restarts after this sub-formula
            var subformulaMultiplicity = 1.0
            var restartIndex = firstClose+1
            var formulaAfterClose =composition.substring(restartIndex) 
            // First, see if the next number starts immediately after the close bracket
            if (formulaAfterClose.search(numberRegexp) == 0) {
                // Get the matching number
                var multiplicityString = numberRegexp.exec(formulaAfterClose)
                subformulaMultiplicity = Number.parseFloat(multiplicityString)
                restartIndex += multiplicityString.length
            }
            var subFormula = composition.substring(previousOpen+1, firstClose)
            
            // create the hash of elements for the subformula
            var subHash = hashFromBracketlessComposition(subFormula)
            // multiply by the multiplicity
            subHash = weightHash(subHash, subformulaMultiplicity)
            // stringify the expanded subformula
            var expandedFormula = stringifyElementHash(subHash)
            console.log(expandedFormula)
            // splice the expanded formula in to the full formula string
            var prefix = composition.substring(0, previousOpen)
            var suffix = composition.substring(restartIndex, composition.length)
            composition = prefix+expandedFormula+suffix
            
        }
        
        var finalHash = hashFromBracketlessComposition(composition)
        return finalHash
    }
    
    
    // Create an element-multiplicity hash from a string formula which does not
    // contain any brackets 
    var hashFromBracketlessComposition = function(composition) {
        // tokenize the composition using a regex matcher
        var bracketlessRegexp = new RegExp(/[A-Z][a-z]?\d*\.?\d*/g) // tokenizes bracketless formulae
        var elementMultiplicityRegexp = new RegExp(/\d/) // finds a number
        var elementRegexp = new RegExp(/[A-Z][a-z]?/) // Extracts the element symbol
        var multiplicityRegexp = new RegExp(/\d+\.?\d*/) // Extracts a positive decimal number
        
        var tokens = composition.match(bracketlessRegexp)
        
        // Add '1' to the end of any tokens that do not have an explicit multiplicity
        tokens = _.map(tokens, function(token, index, list) {
            if (token.search(elementMultiplicityRegexp) == -1)
                return token+'1'
            else
                return token
        })
        
        // create an empty hash
        var compositionHash = _.reduce(tokens, function(memo, token, index) {
            var element = elementRegexp.exec(token)[0]
            var multiplicity = multiplicityRegexp.exec(token)[0]
            // add to or assign
            if (multiplicity > 0) {
                if (element in memo)
                    memo[element] += Number.parseFloat(multiplicity)
                else
                    memo[element] = Number.parseFloat(multiplicity)
            }
            return memo
        }, /*memo*/{})
        
        return compositionHash
    }
    
    // multiply the multiplicity values of a hash by a multiplier
    var weightHash = function(elementHash, multiplier) {
        return _.reduce(elementHash, function(newHash, multiplicity, elementKey, oldHash) {
            newHash[elementKey] = multiplicity*this.multiplier
            return newHash
        }, {}, {multiplier: multiplier})
    }
    
    // Add two compositions, weighted by their molar abundances. Return the unweighted composition.
    var abundanceWeightedSum = function(compositionA, abundanceA, compositionB, abundanceB) {
        
        var newAbundance = abundanceA + abundanceB
    
        var weightedA = weightHash(compositionA, abundanceA)
        var weightedB = weightHash(compositionB, abundanceB)
        
        var newComposition = _.reduce(weightedB, function(compoMemo, compoValue, elementKey, composition) {
            if (elementKey in compoMemo)
                compoMemo[elementKey] += compoValue
            else
                compoMemo[elementKey] = compoValue
            return compoMemo
        }, weightedA)
        
        var unweightedNewComposition = weightHash(newComposition, 1/newAbundance) 
        
        return {abundance: newAbundance, composition: unweightedNewComposition}
    }
    
    // Turn an element-multiplicity hash into a string
    var stringifyElementHash = function(elementHash) {
        var keysOrder = ('C' in elementHash) ?
                Object.keys(elementHash).sort(compareHill) :
                    Object.keys(elementHash).sort()
        return _.reduce(keysOrder, function(memo, key, index, keys) {
            var multiplicity = elementHash[key]
            if (Number.isFinite(multiplicity) && multiplicity != 0) 
                return memo+key+( (multiplicity != 1) ? formatDecimalTo3(multiplicity) : '')
            else
                return memo
        }, /*memo*/'')
        
    }
    
    var formatDecimalTo3 = function(theNumber) {
        var theString = theNumber.toFixed(3)
        
        // truncate trailing zeroes if the number contains a decimal point
        if (theString.indexOf('.') != -1) {
            // remove zeroes until there are no more
            while (theString.charAt(theString.length-1) === '0')
                theString = theString.substring(0, theString.length-1)
            // remove a decimal point 
            if (theString.charAt(theString.length-1) === '.')
                 theString = theString.substring(0, theString.length-1)
        }
        return theString
    }
    
    var hillOrder = function(elementSymbol) {
        var hillOrdered = ['C', 'H',
                       'Ac', 'Ag', 'Al', 'Am', 'Ar', 'As', 'At', 'Au',
                       'B', 'Ba', 'Be', 'Bi', 'Bk', 'Br',
                       'Cd', 'Ce', 'Cf', 'Cl', 'Cm', 'Co', 'Cr', 'Cs', 'Cu',
                       'Dy',
                       'Er', 'Es', 'Eu',
                       'F', 'Fe', 'Fm', 'Fr',
                       'Ga', 'Gd', 'Ge',
                       'He', 'Hf', 'Hg', 'Ho',
                       'I', 'In', 'Ir',
                       'K',
                       'La', 'Li', 'Lu',
                       'Mg', 'Mn', 'Mo',
                       'N', 'Na', 'Nb', 'Nd', 'Ne', 'Ni', 'Np',
                       'O', 'Os',
                       'P', 'Pa', 'Pb', 'Pd', 'Pm', 'Po', 'Pr', 'Pt', 'Pu',
                       'Ra', 'Rb', 'Re', 'Rh', 'Rn', 'Ru',
                       'S', 'Sb', 'Sc', 'Se', 'Si', 'Sm', 'Sn', 'Sr',
                       'Ta', 'Tb', 'Tc', 'Te', 'Th', 'Ti', 'Tl', 'Tm',
                       'U',
                       'V',
                       'W',
                       'Xe',
                       'Y', 'Yb',
                       'Zn', 'Zr',
                       ]
        return _.indexOf(hillOrdered, elementSymbol)
    }

    var compareHill = function(elementA, elementB) {
        return hillOrder(elementA) - hillOrder(elementB)
    }
    
    // Given a string, returns the same string with all numbers converted to Unicode subscripts
    var subscriptifyNumbers = function(input) {
        return input.
            replace(/0/g, '₀').replace(/1/g, '₁').
            replace(/2/g, '₂').replace(/3/g, '₃').
            replace(/4/g, '₄').replace(/5/g, '₅').
            replace(/6/g, '₆').replace(/7/g, '₇').
            replace(/8/g, '₈').replace(/9/g, '₉')
    }

    // Atomic masses of the elements. A list of elements can be obtained with Object.keys(elementMasses).
    var elementMasses = {
         'H': 1.0080,                                                                                                                                                                                                                                  'He': 4.003,
         'Li': 6.94,   'Be': 9.012,                                                                                                                                              'B' : 10.81,  'C' : 12.01,  'N' : 14.01,  'O' : 16.00,  'F' : 19.00,  'Ne': 20.18,
         'Na': 22.99,  'Mg': 24.31,                                                                                                                                              'Al': 26.98,  'Si': 28.09,  'P' : 30.97,  'S' : 32.06,  'Cl': 35.45,  'Ar': 39.95,
         'K' : 39.10,  'Ca': 40.08,  'Sc': 44.96,  'Ti':47.87,   'V' : 50.94,  'Cr': 52.00,  'Mn': 54.94,  'Fe': 55.85,  'Co': 58.93,  'Ni': 58.69,  'Cu': 63.55,  'Zn': 65.38,  'Ga': 69.72,  'Ge': 72.63,  'As': 74.92,  'Se': 78.97,  'Br': 79.90,  'Kr': 83.80,
         'Rb': 84.47,  'Sr': 87.62,  'Y' : 88.91,  'Zr': 91.22,  'Nb': 92.91,  'Mo': 95.95,  'Tc': 97.91,  'Ru': 101.07, 'Rh': 102.91, 'Pd': 106.42, 'Ag': 107.87, 'Cd': 112.41, 'In': 114.82, 'Sn': 118.71, 'Sb': 121.76, 'Te': 127.60, 'I' : 126.90, 'Xe': 131.29,
         'Cs': 132.91, 'Ba': 137.33, 'La': 138.91, 'Hf': 178.49, 'Ta': 180.95, 'W' : 183.84, 'Re': 186.21, 'Os': 190.23, 'Ir': 192.22, 'Pt': 195.08, 'Au': 196.97, 'Hg': 200.59, 'Tl': 204.38, 'Pb': 207.2,  'Bi': 208.98, 'Po': 208.98, 'At': 209.99, 'Rn': 222.02,
         'Fr': 223.02, 'Ra': 226.03, 'Ac': 227.03,
                                                   'Ce': 140.12, 'Pr': 140.91, 'Nd': 144.24, 'Pm': 144.91, 'Sm': 150.36, 'Eu': 151.96, 'Gd': 157.25, 'Tb': 158.93, 'Dy': 162.50, 'Ho': 164.93, 'Er':167.26,  'Tm': 168.93, 'Yb': 173.05, 'Lu': 174.97,
                                                   'Th': 232.04, 'Pa': 231.04, 'U' : 238.03, 'Np': 237.05, 'Pu': 244.06, 'Am': 243.06, 'Cm': 247.07, 'Bk': 247.07, 'Cf': 251.08, 'Es': 252.08, 'Fm': 257.10,
    }

    //  return the molecular mass of the passed element hash
    var massOfElementHash = function(hash) {
        mass = _.reduce(hash, function(memo, multiplicity, element, hash) {
            return memo += multiplicity*elementMasses[element]
        }, 0.0)
        return mass
    }
    
    
    // Public API
    return {
        composeDensity: function(phaseCollection, molarFractionArray) {
            // Get the densities of each phase
            var densities = phaseCollection.pluck('DENSITY')
            // Get the composition strings
            var compositions = phaseCollection.pluck('SEQUENCE')
            // Convert the formulae into a element symbol -> multiplicity hash
            var sumOfTerms = _.reduce(compositions, function(memo, composition, index, compositions) {
                var molarFraction = molarFractionArray[index]
                if (typeof molarFraction === 'string') molarFraction = Number.parseFloat(molarFraction)
                
                var phaseMolarMass = massOfElementHash(hashFromComposition(composition))
                var phaseDensity = densities[index]
                if (typeof phaseDensity === 'string') phaseDensity = Number.parseFloat(phaseDensity)
                
                // fraction of phase i times molar mass of phase i
                var fimi = molarFraction*phaseMolarMass
                
                return {fimi: memo.fimi += fimi,
                        fimi_rhoi: memo.fimi_rhoi += fimi/phaseDensity}
                
            }, /*memo*/{fimi:0.0, fimi_rhoi: 0.0})

            var density = sumOfTerms.fimi / sumOfTerms.fimi_rhoi
            return formatDecimalTo3(density)
        },
        
        composeComposition: function(phaseCollection, molarFractionArray, doSubscriptify) {

            var overallString
            if (phaseCollection.length > 0/*1*/) {
                // Get the composition strings
                var compositions = phaseCollection.pluck('SEQUENCE')
                // Convert the formulae into a element symbol -> multiplicity hash
                var elementHash = _.reduce(compositions, function(memo, composition, index, compositions) {
                    var molarFraction = molarFractionArray[index]
                    if (typeof molarFraction === 'string') molarFraction = Number.parseFloat(molarFraction)
                    var result = abundanceWeightedSum(memo.composition, memo.abundance, hashFromComposition(composition), molarFraction)
                    console.log(result.composition, result.abundance)
                    return result
                }, /*memo*/{abundance:0, composition: {}})
                overallString = stringifyElementHash(elementHash.composition)
            } else {
                // Case where there is only one phase
                overallString = phaseCollection.at(0).get('SEQUENCE')
            }
            return (doSubscriptify) ? subscriptifyNumbers(overallString) : overallString
        },
        
        molecularMassFromComposition: function(compositionString) {
            var mass = massOfElementHash(hashFromComposition(compositionString)) 
            return mass
        },
        
    }
    
})