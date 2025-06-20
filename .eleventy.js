import { EleventyRenderPlugin } from '@11ty/eleventy';
import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';

export default function (eleventyConfig) {
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
}
