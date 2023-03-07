/// <reference types="express" />
import { Request } from '@loopback/rest';
export declare class AuthController {
    private req;
    constructor(req: Request);
    auth(payload: {
        walletAddress: string;
    }): Promise<any>;
}
