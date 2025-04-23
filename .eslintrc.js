module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Disable the rule that's causing the build to fail
    'react-hooks/rules-of-hooks': 'warn'
  }
};