module.exports = function (eleventyConfig) {
  // Copy over various static files
  eleventyConfig.addPassthroughCopy(
    'src/**/*.(gif|ico|jpg|png|svg|woff|woff2)'
  );

  // Refresh without re-building for CSS & JS changes
  eleventyConfig.setBrowserSyncConfig({
    files: ['dist/**/*.js', 'dist/**/*.css'],
  });

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
