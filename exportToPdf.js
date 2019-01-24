'use strict';

const puppeteer = require('puppeteer');

// URL to load should be passed as first parameter
// const url = process.argv[2];
const url = `https://grafana.webmonitor.com.br/dashboards`;
// Username and password (with colon separator) should be second parameter
const auth_string = process.argv[2];
// Output file name should be third parameter
const outfile = `grafana-webmonitor.pdf`;

// TODO: Output an error message if number of arguments is not right or arguments are invalid

// Set the browser width in pixels. The paper size will be calculated on the basus of 96dpi,
// so 1200 corresponds to 12.5".
const width_px = 1300;
// Note that to get an actual paper size, e.g. Letter, you will want to *not* simply set the pixel
// size here, since that would lead to a "mobile-sized" screen (816px), and mess up the rendering.
// Instead, set e.g. double the size here (1632px), and call page.pdf() with format: 'Letter' and
// scale = 0.5.

// Generate authorization header for basic auth
const auth_header = 'Basic ' + new Buffer.from(auth_string).toString('base64');

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
    width: width_px,
    height: 1100,
    deviceScaleFactor: 2,
    isMobile: false
  })

  // Wait until all network connections are closed (and none are opened withing 0.5s).
  // In some cases it may be appropriate to change this to {waitUntil: 'networkidle2'},
  // which stops when there are only 2 or fewer connections remaining.
  await page.goto(url, {waitUntil: 'networkidle0'});
  // await page.goto(url);

    await page.waitFor('input[type=text]');
    page.click('input[type=text]');
    await page.type('input[type=text]', 'renner sitef');
    await page.waitFor(4000);
    page.click('body > grafana-app > div > div > div > div > manage-dashboards > div > div:nth-child(5) > div.search-results-container > dashboard-search-results > div > div:nth-child(3) > a:nth-child(1)');
    // await Promise.all([
    //   page.waitForNavigation(),
    //   page.click('body > grafana-app > div > div > div > div > manage-dashboards > div > div:nth-child(5) > div.search-results-container > dashboard-search-results > div > div:nth-child(3) > a:nth-child(1)')
    // ]);
  // Hide all panel description (top-left "i") pop-up handles and, all panel resize handles
  // Annoyingly, it seems you can't concatenate the two object collections into one
  // await page.evaluate(() => {
    // let infoCorners = document.getElementsByClassName('panel-info-corner');
    // for (el of infoCorners) { el.hidden = true; };
    // let resizeHandles = document.getElementsByClassName('react-resizable-handle');
    // for (el of resizeHandles) { el.hidden = true; };
    // let sidemenu = document.getElementsByClassName('sidemenu');
    // for (el of sidemenu) { el.hidden = true; };
    // let navbar = document.getElementsByClassName('navbar');
    // for (el of navbar) { el.hidden = true; };
  // });

  await page.waitForNavigation('networkidle0');
  // await page.waitForSelector('body > grafana-app > div > div > div > div > div')


  // Get the height of the main canvas, and add a margin
  var height_px = 50;

  // await page.emulateMedia('screen');
  await page.pdf({
    path: `${outfile}`,
    // width: width_px + 'px',
    // height: height_px + 'px',
    
    width: 1300,
    height: 1100,
    // format: 'Letter', <-- see note above for generating "paper-sized" outputs
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

  await browser.close();
});