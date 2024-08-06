"use client";

import { Separator } from "@/components/ui/separator";
import React from "react";
import { UserColumn, userColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";

interface DataClientProps {
  data: UserColumn[];
}

const DataClient: React.FC<DataClientProps> = ({ data }) => {

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`User List (${data.length})`} description="Manage your customer users"/>
      </div>
      <Separator />
      <DataTable
        searchKey="name"
        dateKey="createdAt"
        columns={userColumns}
        data={data}
      />
    </>
  );
};

export default DataClient;
