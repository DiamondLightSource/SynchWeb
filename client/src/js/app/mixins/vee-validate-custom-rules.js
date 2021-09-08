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
  }
}