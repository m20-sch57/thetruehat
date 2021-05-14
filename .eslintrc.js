// eslint-disable-next-line no-undef
module.exports = {
    "env": {
        "amd": true,
        "browser": true,
        "es2021": true,
        "node": true
    },
    "globals": {
        "webpackConfig": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:vue/essential"
    ],
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "vue"
    ],
    "ignorePatterns": ["server.js", "feedbackServer.js", "static/*", "src/version.js"],
    "rules": {
        "indent": ["error", 4],
        "quotes": ["error", "double"],
        "semi": ["error", "always"],
        "eqeqeq": ["warn"]
    },
    "overrides": [
        {
            "files": ["*.vue"],
            "rules": {
                "indent": ["error", 2]
            }
        }
    ]
};
