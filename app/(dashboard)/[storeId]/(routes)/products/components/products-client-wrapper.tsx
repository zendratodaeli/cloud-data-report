"use client";

import { useRef } from "react";
import StorePerformance from "@/components/chart/store-performance";
import ProductClient from "./client";
import DownloadButton from "@/components/download-button";
import { Product, ProductColumn } from "@/types";

interface ProductsClientWrapperProps {
  products: Product[];
  formattedProducts: ProductColumn[];
}

const ProductsClientWrapper: React.FC<ProductsClientWrapperProps> = ({ products, formattedProducts }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <StorePerformance products={products} chartRef={chartRef} />
      <ProductClient data={formattedProducts} />
      <DownloadButton data={formattedProducts} chartRef={chartRef} />
    </div>
  );
};

export default ProductsClientWrapper;