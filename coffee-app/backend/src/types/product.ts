export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  roastLevel: string;
  grind: string;
  size: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductInput {
  name: string;
  description: string;
  price: number;
  image: string;
  roastLevel: string;
  grind: string;
  size: string;
  stock?: number;
}
