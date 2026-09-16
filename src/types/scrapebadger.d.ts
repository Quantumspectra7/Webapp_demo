declare module "scrapebadger" {
  export class ScrapeBadger {
    constructor(options: { apiKey: string; timeout?: number; maxRetries?: number });
    google: {
      googleAiOverviewInlineSerpBlock(params: {
        q?: string;
        query?: string;
        gl?: string;
        hl?: string;
        [key: string]: any;
      }): Promise<any>;
      [key: string]: any;
    };
    [key: string]: any;
  }
}
