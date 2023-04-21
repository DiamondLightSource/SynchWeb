module.exports = {
    extends: [
        'eslint:recommended',
        "plugin:backbone/recommended"
    ],
    "ignorePatterns": ["temp.js", "**/vendor/**", "**/src/js/app/**", "**/**/*vue*"],
    rules: {
    // override/add rules settings here, such as:
    'no-unused-vars': 0, // mostly flags unused vars in function signatures - which could be tidied up, but are quite prevalent so not worth the effort
    'no-undef': 0, // picks up lots of backbone defaults
    'backbone/model-defaults': 0, // widely abused issue - so unlikely to be addressed without considerable effort
    'backbone/collection-model': 0, // ditto
    'backbone/defaults-on-top': 0, // ditto
    'backbone/initialize-on-top': 0 // ditto
    },
    env: {
    es6: true,
    amd: true // registers globals for define and require
    },
    parserOptions: {
        "ecmaVersion": 11,
        "sourceType": "module"
    }
}