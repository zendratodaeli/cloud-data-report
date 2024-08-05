import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type SoldColumn = {
  id: string;
  productName: string;
  totalSoldOut: number;
  income: string;
  netProfit: string;
  createdAt: string;
};


export const columns: ColumnDef<SoldColumn>[] = [
  {
    accessorKey: "productName",
    header: "Product Name",
  },
  {
    accessorKey: "totalSoldOut",
    header: "Today Sold Out",
  },
  {
    accessorKey: "income",
    header: "Income",
  },
  {
    accessorKey: "netProfit",
    header: "Net Profit",
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

