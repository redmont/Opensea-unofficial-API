import {inject} from '@loopback/core';
import {
  Request,
  RestBindings,
  post,
  response,
  ResponseObject,
  param,
  requestBody,
} from '@loopback/rest';
const {XMLHttpRequest} =require('xmlhttprequest');
const ethers = require('ethers');
require('dotenv').config();

const AUTH_RESPONSE: ResponseObject = {
  description: 'auth Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'AccessToken',
        properties: {
          accessToken: {type: 'string'},
        },
      },
    },
  },
};

const wallet = new ethers.Wallet(process.env.PK_7);

export class AuthController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {
  }
  // Map to `POST /auth/challenge`
  @post('/auth/getToken')
  @response(200, AUTH_RESPONSE)
  async auth(@requestBody() payload: {walletAddress:string}): Promise<any> {
    const response = await globalThis.page.evaluate(async (walletAddress:string) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://core-api.prod.blur.io/auth/challenge");
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.send(JSON.stringify({walletAddress: walletAddress}));

      return new Promise((resolve) => {
          xhr.onload = () => {
              resolve(JSON.parse(xhr.responseText));
          };
      });
    },payload.walletAddress);

    const signature = await wallet.signMessage(response.message);
    
    response.signature = signature;
    
    const loginResponse = await globalThis.page.evaluate(async (body:any) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://core-api.prod.blur.io/auth/login");
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.send(JSON.stringify(body));
      return new Promise((resolve) => {
          xhr.onload = () => {
              resolve(xhr.responseText);
          };
      });
    },response);

    return loginResponse
  }
   
  }

