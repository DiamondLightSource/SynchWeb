module.exports = {
    extends: [
        // add more generic rulesets here, such as:
        'eslint:recommended',
        'plugin:vue/recommended' // Vue.js 2.x rules
      ],
      "ignorePatterns": ["temp.js", "**/vendor/**"],
      rules: {
        // override/add rules settings here, such as:
        // 'vue/no-unused-vars': 'error'
      },
      env: {
        amd: true // registers globals for define and require
      },
}