import StorePerformance from "@/components/chart/store-performance";
import ProductClient from "./components/client";
import DownloadButton from "@/components/download-button";
import { formatter } from "@/lib/utils";
import { format } from "date-fns";
import { ProductColumn } from "./components/columns";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

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
    grossIncome: formatter.format(item.grossIncome), // Add gross income
    income: formatter.format(item.income),
    tax: `${item.tax}%`,
    profit: formatter.format(item.profit),
    category: item.category.name,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  const transformedProducts = products.map((product) => ({
    ...product,
    pricePerPiece: Number(product.pricePerPiece),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    sold: product.sold.map((soldItem) => ({
      ...soldItem,
      createdAt: soldItem.createdAt.toISOString(),
      updatedAt: soldItem.updatedAt.toISOString(),
    })),
    category: {
      ...product.category,
      createdAt: product.category.createdAt.toISOString(),
      updatedAt: product.category.updatedAt.toISOString(),
    },
    store: {
      ...product.store,
      createdAt: product.store.createdAt.toISOString(),
      updatedAt: product.store.updatedAt.toISOString(),
    },
  }));

  return (
    <div className="flex-col pt-16">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <StorePerformance products={transformedProducts} />
        <ProductClient data={formattedProducts} />
        <DownloadButton data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;