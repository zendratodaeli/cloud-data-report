import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type ProductColumn = {
  id: string;
  name: string;
  pricePerPiece: string;
  capital: string;
  quantity: number;
  remainQuantity: number;
  income: string;
  tax: string;
  profit: string;
  category: string;
  createdAt: string;
};


export const columns: ColumnDef<ProductColumn>[] = [
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
    accessorKey: "income",
    header: "Income",
  },
  {
    accessorKey: "tax",
    header: "Tax",
  },
  {
    accessorKey: "profit",
    header: "Profit",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

