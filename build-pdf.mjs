import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import rehypeInline from 'rehype-inline';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';

dotenv.config();
const docraptorApiKey = process.env.DOCRAPTOR_API_KEY;
const docraptorTest = process.env.DOCRAPTOR_TEST;
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(currentDir, 'dist', 'pdf');

/**
 * Inline Assets
 * Uses rehype/unified to inline assets like CSS and JS.
 */
const inlineCssAndJs = unified()
  .use(rehypeParse, { fragment: false })
  .use(rehypeInline, { css: true, js: true, imports: true, images: false })
  .use(rehypeStringify);

const inlineImages = unified()
  .use(rehypeParse, { fragment: false })
  .use(rehypeInline, { css: false, js: false, imports: false, images: true })
  .use(rehypeStringify);

/**
 * Get HTML From File
 * Gets the contents of an HTML file and prepares it for PDF generation
 * by inlining assets like CSS and images.
 *
 * @param {string} htmlPath - the HTML file to load
 * @returns {string} the contents of the HTML file with inlined CSS
 */
const getHtmlFromFile = async (htmlPath) => {
  // Grab the HTML file contents as a string
  const rawHTML = await fs.readFile(htmlPath, 'utf8');
  // Change the CSS URI to a path so it can be inlined
  let updatedHTML = rawHTML.replace('/style.css', 'dist/style.css');
  // Inline the CSS and JS
  updatedHTML = String(await inlineCssAndJs.process(updatedHTML));
  // Change any image URLs to paths so they can be inlined
  updatedHTML = updatedHTML.replaceAll('/images/', 'dist/images/');
  // Remove all links
  updatedHTML = updatedHTML.replaceAll(/href=".*?"/g, '');
  // Inline the assets
  return String(await inlineImages.process(updatedHTML));
};

/**
 * Fetch PDF
 * Creates a PDF file from HTML using DocRaptor.
 *
 * @see https://docraptor.com/documentation/api
 * @param {string} html - passed to docraptor
 * @param {string} slug - used for better error logging only
 * @returns {Buffer}
 */
const fetchPDF = async (html, slug) => {
  if (!docraptorApiKey) throw new Error('Missing DocRaptor API Key');
  // Send HTML to DocRaptor to generate PDF
  const pdfRes = await fetch('https://docraptor.com/docs', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(docraptorApiKey).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      test: docraptorTest,
      document_content: html,
      type: 'pdf',
      prince_options: {
        profile: 'PDF/UA-1', // Adds accessibility features like tagging
      },
    }),
  });
  if (!pdfRes.ok)
    throw new Error(
      `${slug}: ${pdfRes.status} ${pdfRes.statusText} ${await pdfRes.text()}`,
    );
  // Extract the PDF from the response and return it
  const blob = await pdfRes.blob();
  return Buffer.from(await blob.arrayBuffer(), 'binary');
};

/**
 * Get Meta Information
 * Takes an HTML path and returns meta information, including the slug,
 * HTML path relative to the current working directory, and the PDF path.
 *
 * @param {string} htmlPath - the HTML file to load
 * @param {string} slug - the filename to use for the PDF
 * @returns {object} meta - slug and path info
 */
const getMeta = (htmlPath, slug) => {
  // Create relative HTML path and PDF write destination
  const htmlPathCWD = path.join(currentDir, htmlPath);
  // Create the PDF write destination
  const pdfPath = path.join(distDir, `${slug}.pdf`);
  return {
    slug,
    htmlPathCWD,
    pdfPath,
  };
};

/**
 * Create a PDF from an HTML file
 *
 * @param {string} htmlPath - the HTML file to load
 */
const generatePDF = async (htmlPath, slug) => {
  // Get the slug and path info for this HTML file
  const meta = getMeta(htmlPath, slug);
  // Get the contents of the HTML file
  const html = await getHtmlFromFile(meta.htmlPathCWD);
  // Create a PDF from the HTML contents
  const pdf = await fetchPDF(html, meta.slug);
  // Create the output directory if it doesn't exist
  await fs.mkdir(distDir, { recursive: true });
  // Save the PDF to a file
  await fs.writeFile(meta.pdfPath, pdf);
  console.log(`[PDF] Writing ${meta.pdfPath}`);
};

await generatePDF(
  'dist/adventures/the-future-hates-you/onepage/index.html',
  'the-future-hates-you',
);
