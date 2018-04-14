const puppeteer = require('puppeteer');
let browser, page;
beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false
        // args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
});
test('the header has the correct text', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    expect(text).toEqual("Blogster");
});

test('clicking login starts oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
});

test('when signed in, shows logout button', async () => {
    const id = "5acfc2c1bd30270a6c888c3b";
    const Buffer = require('safe-buffer').Buffer;
    const sessionObject = {
        passport: {
            user: id
        }
    };
    const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
    const KeyGrip = require('keygrip');
    const key = require('../config/keys');
    const keygrip = new KeyGrip([key.cookieKey]);
    const sig = keygrip.sign('session=' + sessionString);
    await page.setCookie({name: "session", value: sessionString});
    await page.setCookie({name: "session.sig", value: sig});
    await page.goto('localhost:3000');
});