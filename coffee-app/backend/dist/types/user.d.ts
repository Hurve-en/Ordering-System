export interface IUser {
    id: number;
    email: string;
    password: string;
    name: string;
    role?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserInput {
    email: string;
    password: string;
    name: string;
}
export interface ILoginPayload {
    email: string;
    password: string;
}
export interface ITokenPayload {
    id: number;
    email: string;
    role?: string;
}
//# sourceMappingURL=user.d.ts.map