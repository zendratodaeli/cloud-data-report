"use client";

import { useRef } from "react";
import StorePerformance from "@/components/chart/store-performance";
import ProductClient from "./client";
import DownloadButton from "@/components/download-button";
import { Product, ProductColumn, Store } from "@/types";

interface ProductsClientWrapperProps {
  products: Product[];
  formattedProducts: ProductColumn[];
  store: Store;
}

const ProductsClientWrapper: React.FC<ProductsClientWrapperProps> = ({ products, formattedProducts, store }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <StorePerformance products={products} chartRef={chartRef} />
      <ProductClient data={formattedProducts} />
      <DownloadButton data={formattedProducts} chartRef={chartRef} store={store} />
    </div>
  );
};

export default ProductsClientWrapper;