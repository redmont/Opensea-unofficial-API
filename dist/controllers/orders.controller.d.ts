/// <reference types="express" />
import { Request } from '@loopback/rest';
export declare class OrdersController {
    private req;
    constructor(req: Request);
    createListingFormat(data: Object): Promise<any>;
    createBuyFormat(data: Object, collection: string, fulldata?: boolean): Promise<any>;
    mapKeyValues: (obj: {
        [key: string]: any;
    }, baseObj: {
        [key: string]: any;
    }) => void;
    decodedData: (x: any) => string;
}
