'use strict';

const puppeteer = require('puppeteer');
require('dotenv').config()

const gf_url = process.env.GF_URL;
const user = process.env.GF_USER;
const pass = process.env.GF_PASS;
const output_pdf = process.env.OUTPUT_PDF;

// Grafana dashboard name should be second parameter
const dash_name = process.argv[2];
const dash_name_treated = dash_name.replace(/-/, ' ');

// Generate authorization header for basic auth
const auth_header = 'Basic ' + new Buffer.from(`${user}:${pass}`).toString('base64');

console.log(`Running puppeteer...`);

puppeteer.launch({
  headless: true,
  args: ['--disable-features=site-per-process'] 
  })
.then(async browser => {  
  const page = await browser.newPage();

  // Set basic auth headers
  await page.setExtraHTTPHeaders({'Authorization': auth_header});

  // Increase timeout from the default of 30 seconds to 120 seconds, to allow for slow-loading panels
  await page.setDefaultNavigationTimeout(120000);

  // Increasing the deviceScaleFactor gets a higher-resolution image. The width should be set to
  // the same value as in page.pdf() below. The height is not important
  await page.setViewport({
    width: 1300,
    height: 1300,
    deviceScaleFactor: 2,
    isMobile: false
  });

  // Wait until all network connections are closed (and none are opened withing 0.5s).
  // In some cases it may be appropriate to change this to {waitUntil: 'networkidle2'},
  // which stops when there are only 2 or fewer connections remaining.
  await page.goto(gf_url, {waitUntil: 'networkidle0'});
  await page.waitFor('input[type=text]');
  page.click('input[type=text]');
  await page.type('input[type=text]', dash_name_treated);
  await page.waitFor(6000);
  page.click('body > grafana-app > div > div > div > div > manage-dashboards > div > div:nth-child(5) > div.search-results-container > dashboard-search-results > div > div:nth-child(3) > a:nth-child(1)');
  await page.waitFor(4000);
  const urlstr = page.url();
  await page.goto(`${urlstr}&kiosk`, {waitUntil: 'networkidle0'});

  await page.pdf({
    path: `${output_pdf}-${dash_name}.pdf`,
    width: 1300,
    height: 1300,
    scale: 0.9,
    displayHeaderFooter: false,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    printBackground: true,
    landscape: false
  });
  
  console.log(`Generated file as ${dash_name}.pdf`);

  console.log(`Done!`);

  await browser.close();
});