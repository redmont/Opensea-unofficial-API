"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const rest_1 = require("@loopback/rest");
const { XMLHttpRequest } = require('xmlhttprequest');
const ethers = require('ethers');
require('dotenv').config();
const AUTH_RESPONSE = {
    description: 'auth Response',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                title: 'AccessToken',
                properties: {
                    accessToken: { type: 'string' },
                },
            },
        },
    },
};
const wallet = new ethers.Wallet(process.env.PK_0);
let AuthController = class AuthController {
    constructor(req) {
        this.req = req;
    }
    // Map to `POST /auth/challenge`
    async auth(payload) {
        const response = await globalThis.page.evaluate(async (walletAddress) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "https://core-api.prod.blur.io/auth/challenge");
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify({ walletAddress: walletAddress }));
            return new Promise((resolve) => {
                xhr.onload = () => {
                    resolve(JSON.parse(xhr.responseText));
                };
            });
        }, payload.walletAddress);
        const signature = await wallet.signMessage(response.message);
        response.signature = signature;
        const loginResponse = await globalThis.page.evaluate(async (body) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "https://core-api.prod.blur.io/auth/login");
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(body));
            return new Promise((resolve) => {
                xhr.onload = () => {
                    resolve(xhr.responseText);
                };
            });
        }, response);
        return loginResponse;
    }
};
tslib_1.__decorate([
    (0, rest_1.post)('/auth/getToken'),
    (0, rest_1.response)(200, AUTH_RESPONSE),
    tslib_1.__param(0, (0, rest_1.requestBody)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "auth", null);
AuthController = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)(rest_1.RestBindings.Http.REQUEST)),
    tslib_1.__metadata("design:paramtypes", [Object])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map