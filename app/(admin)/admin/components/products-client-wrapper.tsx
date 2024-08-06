"use client";

import { useRef } from "react";
import DownloadButton from "@/components/download-button";
import { Product, Store } from "@/types";
import ProductsClient from "./client";
import { ProductsColumn } from "./columns";
import StoresPerformance from "@/components/chart/stores-performance";

interface ProductsClientWrapperProps {
  products: Product[];
  formattedProducts: ProductsColumn[];
  store: Store;
}

const ProductsClientWrapper: React.FC<ProductsClientWrapperProps> = ({ products, formattedProducts, store }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <StoresPerformance products={products} chartRef={chartRef} />
      <ProductsClient data={formattedProducts} />
      <DownloadButton data={formattedProducts} chartRef={chartRef} store={store} />
    </div>
  );
};

export default ProductsClientWrapper;