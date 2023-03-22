/// <reference types="express" />
import { Request } from '@loopback/rest';
export declare class CollectionsController {
    private req;
    constructor(req: Request);
    collectionBids(collection: string): Promise<any>;
    collectionPrices(collection: string): Promise<any>;
    collectionPrice(collection: string, id: string): Promise<any>;
    collections(): Promise<any>;
}
