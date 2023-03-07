"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const tslib_1 = require("tslib");
const application_1 = require("./application");
const puppeteer = require("puppeteer-core");
const proxyChain = require("proxy-chain");
const { executablePath } = require("puppeteer");
tslib_1.__exportStar(require("./application"), exports);
async function main(options = {}) {
    const app = new application_1.ApiBlurUnofficialApplication(options);
    await app.boot();
    await app.start();
    (async () => {
        const oldProxyUrl = "http://brd-customer-hl_42a1952b-zone-residential:d5l1l6bkjfdn@zproxy.lum-superproxy.io:22225";
        // const oldProxyUrl = "http://brd-customer-hl_42a1952b-zone-zone1:ql7yr1ftcr5j@zproxy.lum-superproxy.io:22225"
        // const oldProxyUrl = "http://xnmldktr:p980i7e5knud@185.199.229.156:7492";
        const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
        console.log(newProxyUrl);
        const browser = await puppeteer.launch({
            headless: true,
            devtools: true,
            args: [
                `--proxy-server=${newProxyUrl}`,
                "--disable-web-security",
                "--disable-features=IsolateOrigins",
                "--disable-site-isolation-trials",
            ],
            executablePath: executablePath(),
        });
        globalThis.page = await browser.newPage();
        await globalThis.page.goto("https://core-api.prod.blur.io/v1/");
        await globalThis.page.setExtraHTTPHeaders({
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        });
        console.log("Browser and page initialized");
        const url = app.restServer.url;
        console.log(`Server is running at ${url}`);
        console.log(`Try ${url}/ping`);
    })();
    return app;
}
exports.main = main;
if (require.main === module) {
    // Run the application
    const config = {
        rest: {
            port: +((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000),
            host: process.env.HOST,
            // The `gracePeriodForClose` provides a graceful close for http/https
            // servers with keep-alive clients. The default value is `Infinity`
            // (don't force-close). If you want to immediately destroy all sockets
            // upon stop, set its value to `0`.
            // See https://www.npmjs.com/package/stoppable
            gracePeriodForClose: 5000,
            openApiSpec: {
                // useful when used with OpenAPI-to-GraphQL to locate your application
                setServersFromRequest: true,
            },
        },
    };
    main(config).catch(err => {
        console.error('Cannot start the application.', err);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map