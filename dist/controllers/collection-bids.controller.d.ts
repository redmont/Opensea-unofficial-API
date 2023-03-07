/// <reference types="express" />
import { Request } from '@loopback/rest';
export declare class CollectionBidsController {
    private req;
    constructor(req: Request);
    collectionBidsAccept(data: Object): Promise<any>;
}
