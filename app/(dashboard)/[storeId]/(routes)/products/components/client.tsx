"use client"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React from "react"
import { ProductColumn, columns } from "./columns"
import { DataTableCustom } from "@/components/ui/data-table-custom"

interface ProductClientProps {
  data: ProductColumn[]
}

const ProductClient: React.FC<ProductClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className=" flex items-center justify-between">
        <Heading
          title={`Products (${data.length})`}
          description="Manage products for your store"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/products/new`)}
        >
          <Plus className=" mr-2 h-4 w-4" />
          Add New
        </Button>
      </div> 
      <Separator/>
      <DataTableCustom searchKey="name" dateKey="createdAt" columns={columns} data={data} />
    </>
  )
}

export default ProductClient
