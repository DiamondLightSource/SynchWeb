module.exports = {
    extends: [
        // add more generic rulesets here, such as:
        'plugin:vue/recommended' // Vue.js 2.x rules
      ],
      "ignorePatterns": ["temp.js", "**/vendor/**"],
      rules: {
        // override/add rules settings here, such as:
        // 'vue/no-unused-vars': 'error'
        'vue/require-default-prop': 0, // this is common throughout - should probably be fixed but pollutes output substantially so disabling for now
        'vue/multi-word-component-names': 0 // ditto - though less important - this will require renaming lots of components to protect against quite a minor issue
      },
      env: {
        amd: true // registers globals for define and require
      },
}