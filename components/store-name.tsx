"use client"

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Store {
  id: string;
  name: string;
}

interface StoreNameProps {
  storeId: string;
}

const StoreName = ({ storeId }: StoreNameProps) => {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await axios.get(`/api/stores/${storeId}`);
        setStore(response.data);
      } catch (error) {
        console.error('Error fetching store:', error);
        toast.error("Error fetching store's name")
      }
    };

    fetchStore();
  }, [storeId]);

  if (!store) {
    return <p className='text-xl font-bold text-black dark:text-white cursor-pointer'>No store found for this user.</p>;
  }

  console.log(store)
  return (
    <div>
      <h1 className='text-xl font-bold text-black dark:text-white cursor-pointer'>
        <Link href={`/${storeId}`}>
          {store.name}
        </Link>
      </h1>
    </div>
  );
};

export default StoreName;
