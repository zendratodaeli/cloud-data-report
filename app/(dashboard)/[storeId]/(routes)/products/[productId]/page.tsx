import prismadb from '@/lib/prismadb'
import React from 'react'
import ProductForm from './components/product-form'
import { auth } from '@clerk/nextjs/server'

const ProductPage = async ({
  params
}: {
  params: {productId : string, storeId: string}
}) => {

  const { userId } = auth();

  if(!userId) {
    return null;
  }

  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId
    },
  })

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
      store: {
        userId: userId
      }
    }
  })

  return (
    <div className='flex-col'>
      <div className=' flex-1 space-y-4 p-8 pt-6'>
        <ProductForm 
          categories={categories} 
          initialData={product}
        />
      </div>
    </div>
  )
}

export default ProductPage
