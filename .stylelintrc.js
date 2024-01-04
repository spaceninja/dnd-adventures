module.exports = {
  extends: ['stylelint-config-spaceninja'],
  rules: {
    // conflicts with dndbeyond styles
    'plugin/no-low-performance-animation-properties': null,
  },
};
