"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionBidsController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const rest_1 = require("@loopback/rest");
const { XMLHttpRequest } = require('xmlhttprequest');
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
let CollectionBidsController = class CollectionBidsController {
    constructor(req) {
        this.req = req;
    }
    // Map to `POST /v1/collection-bids/accept`
    async collectionBidsAccept(data) {
        const { authtoken, walletaddress } = this.req.headers;
        const cookies = [{
                'name': 'authToken',
                'value': authtoken
            }, {
                'name': 'walletAddress',
                'value': walletaddress
            }];
        await page.setCookie(...cookies);
        const apiURL = "https://core-api.prod.blur.io/v1/collection-bids/accept";
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
};
tslib_1.__decorate([
    (0, rest_1.post)('/v1/collection-bids/accept'),
    (0, rest_1.response)(200, RESPONSE),
    tslib_1.__param(0, (0, rest_1.requestBody)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CollectionBidsController.prototype, "collectionBidsAccept", null);
CollectionBidsController = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)(rest_1.RestBindings.Http.REQUEST)),
    tslib_1.__metadata("design:paramtypes", [Object])
], CollectionBidsController);
exports.CollectionBidsController = CollectionBidsController;
//# sourceMappingURL=collection-bids.controller.js.map