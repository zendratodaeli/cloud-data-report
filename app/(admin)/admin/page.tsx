import SalesProduct  from '@/components/chart/sales-product'
import StoresPerformance from '@/components/chart/stores-performance';
import UnrealizedProduct from '@/components/chart/unrealized-sales-product';
import UnrealizedStoresPerformance from '@/components/chart/unrealized-stores-performance';
import prismadb from '@/lib/prismadb'
import { auth } from '@clerk/nextjs/server'

const AdminDashboard = async ({ params }: { params: { storeId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const stores = await prismadb.store.findMany({
    include: {
      products: true
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const products = await prismadb.product.findMany({
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

  const transformedStores = stores.map(store => ({
    id: store.id,
    name: store.name,
    userId: store.userId
  }));

  return (
    <div className='pt-16 space-y-10'>
      <div className="w-full flex justify-center pt-10">
        <h1 className="text-2xl font-bold underline">Admin Dashboard</h1>
      </div>
      <div>
        <StoresPerformance products={transformedProducts} stores={transformedStores} />
      </div>
      <UnrealizedStoresPerformance products={transformedProducts} stores={transformedStores}/>
    </div>
  )
}

export default AdminDashboard;