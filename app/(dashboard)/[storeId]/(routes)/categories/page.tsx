import prismadb from '@/lib/prismadb'
import { CategoryColumn } from './components/columns'
import { format } from 'date-fns'
import CategoryClient from './components/client'
import { auth } from '@clerk/nextjs/server'

const CategoriesPage = async ({
  params
}: { params: {storeId : string}}) => {

  const {userId } = auth();

  if(!userId) {
    return null;
  }

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      store: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    storeName: item.store.name,
    createdAt: format(item.createdAt, "MMMM do, yyyy")
  }));


  return (
    <div className='flex-col pt-16'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <CategoryClient data={formattedCategories}/>
      </div>
    </div>
  )
}

export default CategoriesPage