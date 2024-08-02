import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import DownloadButton from "@/components/download-button";
import { auth } from "@clerk/nextjs/server";
import StorePerformance from "@/components/chart/store-performance";

export type ProductColumn = {
  id: string;
  name: string;
  pricePerPiece: string;
  capital: string;
  quantity: number;
  remainQuantity: number;
  soldOutQuantity: number;
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
    accessorKey: "soldOutQuantity",  // Add this column
    header: "Sold Out Quantity",
  },
  {
    accessorKey: "tax",
    header: "Tax",
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
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];