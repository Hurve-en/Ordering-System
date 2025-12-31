export interface IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF';
  address?: string;
  city?: string;
  postalCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ITokenPayload {
  id: string;
  email: string;
  role: string;
}