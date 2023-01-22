module.exports = {
  extends: ['stylelint-config-spaceninja', 'stylelint-config-prettier'],
  rules: {
    // conflicts with dndbeyond styles
    'plugin/no-low-performance-animation-properties': null,
  },
};
