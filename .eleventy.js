const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

module.exports = function (eleventyConfig) {
  // Copy over various static files
  eleventyConfig.addPassthroughCopy(
    'src/**/*.(gif|ico|jpg|png|svg|woff|woff2)'
  );

  // Refresh without re-building for CSS & JS changes
  eleventyConfig.setBrowserSyncConfig({
    files: ['dist/**/*.js', 'dist/**/*.css'],
  });

  // Add MarkdownIt plugins
  let options = {
    html: true,
  };
  let markdownLibrary = markdownIt(options).use(markdownItAnchor);
  eleventyConfig.setLibrary('md', markdownLibrary);

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
