"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const rest_1 = require("@loopback/rest");
const ethers_1 = require("ethers");
const { XMLHttpRequest } = require('xmlhttprequest');
const { ethers } = require("ethers");
const abi = require("../customs/abi/blurExchange").default;
const iface = new ethers_1.Interface(abi);
const RESPONSE = {
    description: 'Response',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                title: 'Info',
                properties: {},
            },
        },
    },
};
let OrdersController = class OrdersController {
    constructor(req) {
        this.req = req;
        this.mapKeyValues = (obj, baseObj) => {
            Object.keys(obj).forEach((key) => {
                if (!Number(key) && key != "0") {
                    let value = obj[key];
                    if (ethers.BigNumber.isBigNumber(value)) {
                        value = ethers.BigNumber.from(value).toString();
                    }
                    baseObj[key] = value;
                    if (typeof value === "object") {
                        baseObj[key] = {};
                        this.mapKeyValues(value, baseObj[key]);
                    }
                }
            });
        };
        this.decodedData = function (x) {
            let plaintext = (function (key, x) {
                let y = "";
                for (let i = 0; i < x.length; i++) {
                    let byte = x.charCodeAt(i) ^ key.charCodeAt(i % key.length), char = String.fromCharCode(byte);
                    y += char;
                }
                return y;
            })("XTtnJ44LDXvZ1MSjdyK4pPT8kg5meJtHF44RdRBGrsaxS6MtG19ekKBxiXgp", Buffer.from(x, "base64").toString("utf-8"));
            return plaintext;
        };
    }
    // Map to `POST /v1/orders/format`
    async createListingFormat(data) {
        const { authtoken, walletaddress } = this.req.headers;
        const cookies = [{
                'name': 'authToken',
                'value': authtoken
            }, {
                'name': 'walletAddress',
                'value': walletaddress
            }];
        await page.setCookie(...cookies);
        const apiURL = "https://core-api.prod.blur.io/v1/orders/format";
        const response = await globalThis.page.evaluate(async (apiURL, data) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", apiURL);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(data));
            return new Promise((resolve) => {
                xhr.onload = () => {
                    resolve(JSON.parse(xhr.responseText));
                };
            });
        }, apiURL, data);
        return response;
    }
    // Map to `POST /v1/orders/submit`
    async submitListing(data) {
        const { authtoken, walletaddress } = this.req.headers;
        const cookies = [{
                'name': 'authToken',
                'value': authtoken
            }, {
                'name': 'walletAddress',
                'value': walletaddress
            }];
        await page.setCookie(...cookies);
        const apiURL = "https://core-api.prod.blur.io/v1/orders/submit";
        const response = await globalThis.page.evaluate(async (apiURL, data) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", apiURL);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(data));
            return new Promise((resolve) => {
                xhr.onload = () => {
                    resolve(JSON.parse(xhr.responseText));
                };
            });
        }, apiURL, data);
        return response;
    }
    // Map to `POST /v1/buy/{collection}?fulldata=true`
    async createBuyFormat(data, collection, fulldata) {
        const { authtoken, walletaddress } = this.req.headers;
        const cookies = [{
                'name': 'authToken',
                'value': authtoken
            }, {
                'name': 'walletAddress',
                'value': walletaddress
            }];
        await page.setCookie(...cookies);
        const apiURL = "https://core-api.prod.blur.io/v1/buy/" + collection;
        const response = await globalThis.page.evaluate(async (apiURL, data) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", apiURL);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(data));
            return new Promise((resolve) => {
                xhr.onload = () => {
                    resolve(JSON.parse(xhr.responseText));
                };
            });
        }, apiURL, data);
        console.log('\n///////RESPONSE////////', response);
        if (fulldata) {
            console.log('\nin fulldata');
            const responseData = [];
            const a = this.decodedData(response.data);
            let decodedDataJson = JSON.parse(a);
            return decodedDataJson;
            //not all function are "execute"
            // responseData.push(decodedDataJson)
            // console.log('decodedDataJson', decodedDataJson.buys[0])
            // decodedDataJson.buys.forEach((buy:any) => {
            //   console.log('\nb4 decode', buy.txnData.data)
            //   let decodedResponse = iface.decodeFunctionData("execute", buy.txnData.data);
            //   console.log('after decode')
            //   let data:any = {};
            //   this.mapKeyValues(decodedResponse, data);
            //   data.decodedResponse = decodedDataJson.buys
            //   responseData.push(data)
            // });
            console.log('\n///////responseData////////', responseData);
            return responseData;
        }
        return response;
    }
};
tslib_1.__decorate([
    (0, rest_1.post)('/v1/orders/format'),
    (0, rest_1.response)(200, RESPONSE),
    tslib_1.__param(0, (0, rest_1.requestBody)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrdersController.prototype, "createListingFormat", null);
tslib_1.__decorate([
    (0, rest_1.post)('/v1/orders/submit'),
    (0, rest_1.response)(200, RESPONSE),
    tslib_1.__param(0, (0, rest_1.requestBody)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrdersController.prototype, "submitListing", null);
tslib_1.__decorate([
    (0, rest_1.post)('/v1/buy/{collection}'),
    (0, rest_1.response)(200, RESPONSE),
    tslib_1.__param(0, (0, rest_1.requestBody)()),
    tslib_1.__param(1, rest_1.param.path.string('collection')),
    tslib_1.__param(2, rest_1.param.query.boolean('fulldata')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, Boolean]),
    tslib_1.__metadata("design:returntype", Promise)
], OrdersController.prototype, "createBuyFormat", null);
OrdersController = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)(rest_1.RestBindings.Http.REQUEST)),
    tslib_1.__metadata("design:paramtypes", [Object])
], OrdersController);
exports.OrdersController = OrdersController;
//# sourceMappingURL=orders.controller.js.map