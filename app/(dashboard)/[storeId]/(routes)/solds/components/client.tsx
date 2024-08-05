"use client"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React from "react"
import { columns, SoldColumn } from "./columns"
import { DataTable } from "@/components/ui/data-table"

interface SoldClientProps {
  data: SoldColumn[]
}

const SoldClient: React.FC<SoldClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className=" flex items-center justify-between">
        <Heading
          title={`Solds (${data.length})`}
          description="Manage solds for your product"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/solds/new`)}
        >
          <Plus className=" mr-2 h-4 w-4" />
          Add New
        </Button>
      </div> 
      <Separator/>
      <DataTable searchKey="productName" dateKey="createdAt" columns={columns} data={data} />
    </>
  )
}

export default SoldClient
