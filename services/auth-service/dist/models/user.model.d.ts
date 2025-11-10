export interface User {
    id: number;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    created_at: Date;
    updated_at: Date;
}
export interface CreateUserDTO {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
}
export declare const createUser: (userData: CreateUserDTO) => Promise<User>;
export declare const getUserByEmail: (email: string) => Promise<User | null>;
export declare const getUserById: (id: number) => Promise<User | null>;
export declare const emailExists: (email: string) => Promise<boolean>;
export declare const updateUser: (id: number, updates: Partial<Omit<User, "id" | "created_at" | "updated_at">>) => Promise<User>;
//# sourceMappingURL=user.model.d.ts.map