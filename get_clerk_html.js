import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  const html = await page.evaluate(() => document.querySelector('.cl-socialButtonsBlockButton').outerHTML);
  console.log(html);
  await browser.close();
})();
