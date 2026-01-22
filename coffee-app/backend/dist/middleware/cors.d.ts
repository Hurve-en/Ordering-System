import cors from 'cors';
import express from 'express';
export declare const corsMiddleware: (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
export declare const optionsHandler: (_req: express.Request, res: express.Response) => void;
//# sourceMappingURL=cors.d.ts.map