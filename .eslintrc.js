module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import"
  ],
  "env": {
    "browser": true,
    "node": true
  },
  "rules": {
    "no-multi-spaces": ["error", {
      exceptions: {
        "VariableDeclarator": true
      }
    }]
  }
};
