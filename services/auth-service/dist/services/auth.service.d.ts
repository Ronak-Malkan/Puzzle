export interface SignupRequest {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface AuthResponse {
    message: string;
    token: string;
    user: {
        id: number;
        email: string;
        firstname: string;
        lastname: string;
    };
}
export declare const signup: (data: SignupRequest) => Promise<AuthResponse>;
export declare const login: (data: LoginRequest) => Promise<AuthResponse>;
export declare const getUserInfo: (userId: number) => Promise<{
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    created_at: Date;
}>;
//# sourceMappingURL=auth.service.d.ts.map