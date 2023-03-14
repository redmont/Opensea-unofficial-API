import { ApiBlurUnofficialApplication, ApplicationConfig } from './application';
export * from './application';
declare global {
    var page: any;
}
export declare function main(options?: ApplicationConfig): Promise<ApiBlurUnofficialApplication>;
