"use strict";
// Uncomment these imports to begin using these cool features!
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionsController = void 0;
const tslib_1 = require("tslib");
// import {inject} from '@loopback/core';
const core_1 = require("@loopback/core");
const rest_1 = require("@loopback/rest");
const { XMLHttpRequest } = require('xmlhttprequest');
require('dotenv').config();
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
let CollectionsController = class CollectionsController {
    constructor(req) {
        this.req = req;
    }
    // Map to `GET /v1/collections/{collection}/executable-bids`
    async collectionBids(collection) {
        const { authtoken, walletaddress } = this.req.headers;
        const cookies = [{
                'name': 'authToken',
                'value': authtoken
            }, {
                'name': 'walletAddress',
                'value': walletaddress
            }];
        await page.setCookie(...cookies);
        const apiURL = "https://core-api.prod.blur.io/v1/collections/" + collection + "/executable-bids?filters=%7B%7D";
        const response = await globalThis.page.evaluate(async (apiURL) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", apiURL);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify({ filters: {} }));
            return new Promise((resolve) => {
                xhr.onload = () => {
                    resolve(JSON.parse(xhr.responseText));
                };
            });
        }, apiURL);
        return response;
    }
    // Map to `GET /v1/collections/{collection}/prices`
    async collectionPrices(collection) {
        const { authtoken, walletaddress } = this.req.headers;
        const cookies = [{
                'name': 'authToken',
                'value': authtoken
            }, {
                'name': 'walletAddress',
                'value': walletaddress
            }];
        await page.setCookie(...cookies);
        const apiURL = "https://core-api.prod.blur.io/v1/collections/" + collection + "/prices";
        const response = await globalThis.page.evaluate(async (apiURL) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", apiURL);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify({ filters: {} }));
            return new Promise((resolve) => {
                xhr.onload = () => {
                    resolve(JSON.parse(xhr.responseText));
                };
            });
        }, apiURL);
        return response;
    }
    // Map to `GET /v1/collections`
    async collections() {
        const { authtoken, walletaddress } = this.req.headers;
        const { filters } = this.req.query;
        const cookies = [{
                'name': 'authToken',
                'value': authtoken
            }, {
                'name': 'walletAddress',
                'value': walletaddress
            }];
        await page.setCookie(...cookies);
        const _filtersString = decodeURIComponent(JSON.stringify(filters));
        const filtersString = decodeURIComponent(JSON.parse(_filtersString));
        const apiURL = `https://core-api.prod.blur.io/v1/collections/?filters=${encodeURIComponent(filtersString)}`;
        const response = await globalThis.page.evaluate(async (apiURL) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", apiURL);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify({ filters: {} }));
            return new Promise((resolve) => {
                xhr.onload = () => {
                    resolve(JSON.parse(xhr.responseText));
                };
            });
        }, apiURL);
        return response;
    }
};
tslib_1.__decorate([
    (0, rest_1.get)('/v1/collections/{collection}/executable-bids'),
    (0, rest_1.response)(200, RESPONSE),
    tslib_1.__param(0, rest_1.param.path.string('collection')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], CollectionsController.prototype, "collectionBids", null);
tslib_1.__decorate([
    (0, rest_1.get)('/v1/collections/{collection}/prices'),
    (0, rest_1.response)(200, RESPONSE),
    tslib_1.__param(0, rest_1.param.path.string('collection')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], CollectionsController.prototype, "collectionPrices", null);
tslib_1.__decorate([
    (0, rest_1.get)('/v1/collections'),
    (0, rest_1.response)(200, RESPONSE),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], CollectionsController.prototype, "collections", null);
CollectionsController = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)(rest_1.RestBindings.Http.REQUEST)),
    tslib_1.__metadata("design:paramtypes", [Object])
], CollectionsController);
exports.CollectionsController = CollectionsController;
//# sourceMappingURL=collections.controller.js.map