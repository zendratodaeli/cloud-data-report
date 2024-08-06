import { ColumnDef } from "@tanstack/react-table";
export type ProductsColumn = {
  store: string,
  id: string;
  name: string;
  pricePerPiece: string;
  capital: string;
  quantity: number;
  remainQuantity: number;
  soldOutQuantity: number;
  grossIncome: string;
  income: string;
  tax: string;
  grossProfit: string;
  profit: string;
  category: string;
  createdAt: string;
};


export const columns: ColumnDef<ProductsColumn>[] = [
  {
    accessorKey: "store",
    header: "Store",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "pricePerPiece",
    header: "Price Per Piece",
  },
  {
    accessorKey: "capital",
    header: "Capital",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "remainQuantity",
    header: "In Stock",
  },
  {
    accessorKey: "soldOutQuantity",
    header: "Sold Out Quantity",
  },
  {
    accessorKey: "tax",
    header: "Tax",
  },
  {
    accessorKey: "grossIncome",
    header: "Gross Income (Before Tax)",
  },
  {
    accessorKey: "grossProfit",
    header: "Gross Profit (Before Tax)",
  },
  {
    accessorKey: "income",
    header: "Net Income (After Tax)",
  },
  {
    accessorKey: "profit",
    header: "Profit (After Tax)",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
];