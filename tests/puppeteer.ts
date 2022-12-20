import { executablePath } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

(async () => {
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: executablePath(),
        // executablePath:
        //     '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        ignoreDefaultArgs: true,
    });
    const page = await browser.newPage();

    await page.goto(
        'https://account.formula1.com/#/fr/login?redirect=https%3A%2F%2Ff1tv.formula1.com%2F'
    );

    page.on('response', async (response) => {
        const request = response.request();
        if (
            request
                .url()
                .includes(
                    'https://api.formula1.com/v2/account/subscriber/authenticate/by-password'
                )
        ) {
            let json;
            try {
                json = await response.json();
            } catch (error) {
                console.log(error);
            }
            console.log(json);
        }
    });
})();

// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// const { executablePath } = require('puppeteer');

// puppeteer
//     .use(StealthPlugin())
//     .launch({ headless: true, executablePath: executablePath() })
//     .then(async (browser) => {
//         const page = await browser.newPage();
//         await page.goto('https://bot.sannysoft.com');
//         await page.waitForTimeout(5000);
//         await page.screenshot({ path: 'stealth.png', fullPage: true });
//         await browser.close();
//     });
