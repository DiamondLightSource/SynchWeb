import { extend } from 'vee-validate'

const isNullOrUndefined = (...values) => {
  return values.every(value => {
    return value === null || value === undefined;
  });
};

extend('closeExp', {
    message: fieldName => fieldName + ' must have correctly closed brackets',
    validate: value => {
        let count = 0;
        for(let i=0; i < value.length; i++){
          if(value.charAt(i) === '(')
            count++
          else if(value.charAt(i) === ')'){
            if(count === 0)
              return false
            else
              count--
          }
        }
        return count === 0;
    }
})

extend('positive_decimal', {
  params: ['decimals', 'separator'],
  validate: (value, { decimals = '*', separator = '.' } = {}) => {
      const validatePositiveDecimalValues = (val) => {
        if (isNullOrUndefined(val) || val === '' || val <= 0) {
          return false;
        }

        const regexPart = decimals === '*' ? '+' : `{1,${decimals}}`;
        const regex = new RegExp(`^\\d*(\\${separator}\\d${regexPart})?([eE]{1}[-]?\\d+)?$`);

        if (! regex.test(val)) {
          return false;
        }

        const parsedValue = parseFloat(val);

        // eslint-disable-next-line
        return parsedValue === parsedValue;
      }

      if (Array.isArray(value)) {
        return value.every(val => validatePositiveDecimalValues(val));
      }

      return validatePositiveDecimalValues(value)
  },
  message: (fieldName, { decimals } = {}) => {
    if (decimals && decimals !== '*') {
      return fieldName + ' must be a positive decimal with a maximum of ' + decimals + ' decimal places'
    }
    return fieldName + ' must be a positive decimal'
  }
})

extend('non_zero_numeric', {
  validate: (value) => {
      const validateNonZeroNumericValues = (val) => {
        if (isNullOrUndefined(val) || val === '' || Number(val) <= 0) {
          return false;
        }

        return Number.isInteger(Number(val))
      }

      if (Array.isArray(value)) {
        return value.every(val => validateNonZeroNumericValues(val));
      }

      return validateNonZeroNumericValues(value)
  },
  message: fieldName => fieldName + ' must be a non-zero whole number'
})

extend('decimal', {
  validate: value => {
    if (value === null || value === undefined || value === '') {
      return true
    }
    // Matches positive and negative floats/integers (e.g., 12, -3.4, 0.5)
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  message: fieldName => fieldName + ' must be a valid decimal number'
})
