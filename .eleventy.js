const { EleventyRenderPlugin } = require('@11ty/eleventy');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

module.exports = function (eleventyConfig) {
  // Copy over various static files
  eleventyConfig.addPassthroughCopy(
    'src/**/*.(gif|ico|jpg|png|svg|webp|woff|woff2)',
  );

  // Watch for CSS changes
  eleventyConfig.addWatchTarget('./src/_scss/');

  // Add Eleventy Render Plugin
  eleventyConfig.addPlugin(EleventyRenderPlugin);

  // Add MarkdownIt plugins
  let options = {
    html: true,
  };
  let markdownLibrary = markdownIt(options).use(markdownItAnchor);
  eleventyConfig.setLibrary('md', markdownLibrary);

  // Add a shortcode for the current year
  eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`);

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
