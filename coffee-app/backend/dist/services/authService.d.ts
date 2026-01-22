import { ITokenPayload } from '../types';
export declare const authService: {
    hashPassword: (password: string) => Promise<string>;
    comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
    generateToken: (payload: ITokenPayload) => string;
    generateRefreshToken: (payload: ITokenPayload) => string;
    verifyToken: (token: string) => ITokenPayload;
    verifyRefreshToken: (token: string) => ITokenPayload;
};
//# sourceMappingURL=authService.d.ts.map