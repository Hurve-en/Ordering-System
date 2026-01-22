import { IUserInput, IUser } from "../types/index.ts";
export declare const userService: {
    createUser: (data: IUserInput) => Promise<IUser>;
    getUserById: (id: number) => Promise<IUser | null>;
    getUserByEmail: (email: string) => Promise<IUser | null>;
    updateUser: (id: number, data: Partial<IUserInput>) => Promise<IUser>;
    getAllUsers: () => Promise<IUser[]>;
};
//# sourceMappingURL=userService.d.ts.map