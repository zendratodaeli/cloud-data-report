import SalesProduct  from '@/components/chart/sales-product'
import UnrealizedProduct from '@/components/chart/unrealized-sales-product';
import prismadb from '@/lib/prismadb'
import { auth } from '@clerk/nextjs/server'

const Dashboard = async ({ params }: { params: { storeId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
      store: {
        userId: userId
      }
    },
    include: {
      category: true,
      store: true
    },
    orderBy: {
      createdAt: "desc",
    },
  })
  

  const transformedProducts = products.map(product => ({
    ...product,
    price: Number(product.price),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    category: {
      ...product.category,
      createdAt: product.category.createdAt.toISOString(),
      updatedAt: product.category.updatedAt.toISOString(),
    },
    store: {
      ...product.store,
      createdAt: product.store.createdAt.toISOString(),
      updatedAt: product.store.updatedAt.toISOString(),
    }
  }));


  return (
    <div className='pt-16 space-y-10'>
      <div>
        <SalesProduct products={transformedProducts} />
      </div>
      <div>
        <UnrealizedProduct products={transformedProducts}/>
      </div>
    </div>
  )
}

export default Dashboard
