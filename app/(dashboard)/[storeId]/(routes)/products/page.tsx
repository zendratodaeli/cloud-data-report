import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { ProductColumn } from "./components/columns";
import { formatter } from "@/lib/utils";
import ProductClient from "./components/client";
import DownloadButton from "@/components/download-button";

const ProductsPage = async ({ params }: { params: { storeId: string } }) => {
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      category: true,
      store: true
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    isSold: item.isSold,
    price: formatter.format(item.price.toNumber()),
    category: item.category.name,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
    storeName: item.store.name
  }));

  console.log(products)

  return (
    <div className="flex-col pt-16">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient data={formattedProducts} />
        <DownloadButton data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;
