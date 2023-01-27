const isNullOrUndefined = (...values) => {
  return values.every(value => {
    return value === null || value === undefined;
  });
};

export default {
  data() {
    return {}
  },
  created() {
    this.$validator.extend('closeExp', {
      getMessage: field => field+ ' must have correctly closed brackets',
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

    this.$validator.extend('field_exists', (value, [otherValue]) => {
      if (otherValue) return true;
    }, {
      hasTarget: true
    })

    this.$validator.extend('positive_decimal', (value, { decimals = '*', separator = '.' } = {}) => {
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
    }, {
      paramNames: ['decimals', 'separator']
    })

    this.$validator.extend('non_zero_numeric', (value) => {
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
    })
  }
}