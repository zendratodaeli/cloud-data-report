// types.ts
export interface Sold {
  id: string;
  productId: string;
  totalSoldOut: number;
  netProfit: number
  income: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  pricePerPiece: number;
  capital: number;
  quantity: number;
  remainQuantity: number;
  income: number;
  tax: number;
  profit: number;
  grossIncome: number;
  grossProfit: number;
  soldOutQuantity: number;
  createdAt: Date;
  updatedAt: Date;
  sold: Sold[];
  category: Category;
  store: Store;
}

export interface ProductColumn {
  id: string;
  name: string;
  pricePerPiece: string;
  capital: string;
  quantity: number;
  remainQuantity: number;
  soldOutQuantity: number;
  grossIncome: string;
  grossProfit: string;
  income: string;
  tax: string;
  profit: string;
  category: string;
  createdAt: string;
}
