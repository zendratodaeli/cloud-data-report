import prismadb from "@/lib/prismadb";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import SoldForm from "./components/sold-form";

const SoldPage = async ({
  params,
}: {
  params: { soldId: string; storeId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const soldRecord = await prismadb.sold.findUnique({
    where: {
      id: params.soldId,
    },
    include: {
      product: true,
      category: true,
    },
  });

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
      store: {
        userId: userId,
      },
    },
    include: {
      category: true,
    },
  });

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
      store: {
        userId: userId,
      },
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SoldForm
          products={products}
          initialData={soldRecord}
          categories={categories}
        />
      </div>
    </div>
  );
};

export default SoldPage;
