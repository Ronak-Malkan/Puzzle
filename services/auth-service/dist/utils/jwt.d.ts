import jwt from 'jsonwebtoken';
export interface TokenPayload {
    id: number;
    email: string;
}
export declare const generateToken: (payload: TokenPayload) => string;
export declare const verifyToken: (token: string) => TokenPayload;
export declare const decodeToken: (token: string) => string | jwt.JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map