/// <reference types="express" />
import { Request } from '@loopback/rest';
export declare class CollectionsController {
    private req;
    constructor(req: Request);
    collectionBids(collection: string): Promise<any>;
    collections(): Promise<any>;
}
