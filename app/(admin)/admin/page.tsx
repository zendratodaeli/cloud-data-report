import prismadb from '@/lib/prismadb'
import { UserButton } from '@clerk/nextjs';
import React from 'react'

const AdminPage = async () => {
  
  const stores = await prismadb.store.findMany({
    include: {
      products: true,
      categories: true
    }
  });
  console.log(stores)

  return (
    <div>
      <p>
        Hi from Admin Page  
      </p>
      <UserButton afterSignOutUrl='/sign-in'/>
    </div>
  )
}

export default AdminPage
