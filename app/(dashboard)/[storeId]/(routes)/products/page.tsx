import { formatter } from "@/lib/utils";
import { format } from "date-fns";
import { ProductColumn } from "./components/columns";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import React from "react";
import ProductsClientWrapper from "./components/products-client-wrapper";
import { Store } from "@/types";

const ProductsPage = async ({ params }: { params: { storeId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
      store: {
        userId: userId,
      },
    },
    include: {
      category: true,
      store: true,
      sold: true
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    pricePerPiece: formatter.format(item.pricePerPiece),
    capital: formatter.format(item.capital),
    quantity: item.quantity,
    remainQuantity: item.remainQuantity,
    soldOutQuantity: item.quantity - item.remainQuantity,
    grossIncome: formatter.format(item.grossIncome),
    income: formatter.format(item.income),
    tax: `${item.tax}%`,
    grossProfit: formatter.format(item.grossProfit),
    profit: formatter.format(item.profit),
    category: item.category.name,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));


  const transformedProducts = products.map((product) => ({
    ...product,
    pricePerPiece: Number(product.pricePerPiece),
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
    sold: product.sold.map((soldItem) => ({
      ...soldItem,
      createdAt: new Date(soldItem.createdAt),
      updatedAt: new Date(soldItem.updatedAt),
    })),
    category: {
      ...product.category,
      createdAt: new Date(product.category.createdAt),
      updatedAt: new Date(product.category.updatedAt),
    },
    store: {
      ...product.store,
      createdAt: new Date(product.store.createdAt),
      updatedAt: new Date(product.store.updatedAt),
    },
  }));

  const store = await prismadb.store.findFirst({
    where: {
      userId: userId
    },
  })

  const defaultStore: Store = {
    id: "default-id",
    userId: userId,
    name: "Default Store",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return (
    <div className="flex-col pt-16">
      <ProductsClientWrapper
        products={transformedProducts}
        formattedProducts={formattedProducts}
        store={store || defaultStore }
      />
    </div>
  );
};

export default ProductsPage;
