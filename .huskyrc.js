module.exports = {
  hooks: {
    'pre-commit': 'lint-staged --config linting/lint-staged.config.js ',
  },
};
