import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

export type UserColumn = {
  userId: string;
  name: string;
  email: string;
  imageUrl: string;
  store: string;
  owner: string;
  address: string;
  phoneNumber: string;
  lastActive: string;
  lastSignIn: string;
  createdAt: string;
};

export const userColumns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: "userId",
    header: "User ID",
  },
  {
    accessorKey: "store",
    header: "Store",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "owner",
    header: "Owner",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "lastActive",
    header: "Last Active",
  },
  {
    accessorKey: "lastSignIn",
    header: "Last Sign In",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div>
        <Image 
          src={row.original.imageUrl} 
          alt={row.original.name} 
          width={50} 
          height={50} 
          className="rounded"
        />
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Join",
  },
];